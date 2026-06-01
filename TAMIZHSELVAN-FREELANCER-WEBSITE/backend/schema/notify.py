# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="My Backend API",
    description="A simple FastAPI backend for managing items."
)

# Pydantic model for data validation (defines the structure of an Item)
class Item(BaseModel):
    name: str
    price: float
    is_offer: Optional[bool] = None

# A simple in-memory database (for demonstration)
fake_db = []

@app.get("/")
def read_root():
    """Welcome message for the API root."""
    return {"message": "Welcome to the FastAPI Backend"}

@app.get("/items/", response_model=List[Item])
def read_items():
    """Retrieve all items."""
    return fake_db

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    """Retrieve a specific item by ID."""
    if item_id >= len(fake_db):
        return {"error": "Item not found"}
    item = fake_db[item_id]
    return {"item_id": item_id, **item.dict(), "q": q}

@app.post("/items/", response_model=Item, status_code=201)
def create_item(item: Item):
    """Create a new item."""
    fake_db.append(item)
    return item

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    """Update an existing item."""
    if item_id >= len(fake_db):
        return {"error": "Item not found"}
    fake_db[item_id] = item
    return {"item_name": item.name, "item_id": item_id}
