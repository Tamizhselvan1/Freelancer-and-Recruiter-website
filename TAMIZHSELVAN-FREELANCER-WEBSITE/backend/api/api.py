from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

router = APIRouter()

# -----------------------------
# Email Configuration
# -----------------------------

conf = ConnectionConfig(
    MAIL_USERNAME="yourgmail@gmail.com",
    MAIL_PASSWORD="your_app_password",
    MAIL_FROM="yourgmail@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="Freelancer Platform",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

# -----------------------------
# Models
# -----------------------------

class JobApplication(BaseModel):
    freelancer_name: str
    freelancer_email: EmailStr
    job_title: str
    company_name: str


class StatusUpdate(BaseModel):
    status: str


# -----------------------------
# Fake Database
# -----------------------------

applications = []
counter = 1


# -----------------------------
# Apply Job API
# -----------------------------

@router.post("/apply-job")
def apply_job(data: JobApplication):

    global counter

    application = {
        "id": counter,
        "freelancer_name": data.freelancer_name,
        "freelancer_email": data.freelancer_email,
        "job_title": data.job_title,
        "company_name": data.company_name,
        "status": "pending"
    }

    applications.append(application)
    counter += 1

    return {"message": "Application submitted", "data": application}


# -----------------------------
# Get Applications
# -----------------------------

@router.get("/applications", response_model=List[dict])
def get_applications():
    return applications


# -----------------------------
# Accept / Reject Application
# -----------------------------

@router.put("/application/{app_id}")
async def update_application(app_id: int, update: StatusUpdate):

    for app_data in applications:

        if app_data["id"] == app_id:

            app_data["status"] = update.status

            # -----------------------------
            # Accepted Email
            # -----------------------------

            if update.status == "accepted":

                subject = "Job Application Accepted 🎉"

                body = f"""
Hello {app_data['freelancer_name']},

Congratulations!

Your application for "{app_data['job_title']}" at
{app_data['company_name']} has been ACCEPTED.

Login to your freelancer dashboard to contact the recruiter.

Best Regards
Freelancer Platform
"""

            else:

                subject = "Job Application Update"

                body = f"""
Hello {app_data['freelancer_name']},

Thank you for applying for "{app_data['job_title']}" at
{app_data['company_name']}.

Unfortunately, the recruiter has selected another candidate.

You can apply for other jobs on our platform.

Best Regards
Freelancer Platform
"""

            message = MessageSchema(
                subject=subject,
                recipients=[app_data["freelancer_email"]],
                body=body,
                subtype="plain"
            )

            fm = FastMail(conf)
            await fm.send_message(message)

            return {"message": "Status updated and email sent", "data": app_data}

    raise HTTPException(status_code=404, detail="Application not found")