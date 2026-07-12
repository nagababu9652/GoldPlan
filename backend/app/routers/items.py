from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.item import Item
from ..schemas.item import ItemCreate, ItemRead

router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemRead)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Create a new item."""
    db_item = Item(title=item.title, description=item.description or "", completed=item.completed)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/{item_id}", response_model=ItemRead)
def read_item(item_id: int, db: Session = Depends(get_db)):
    """Get a single item by ID."""
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.get("/", response_model=list[ItemRead])
def list_items(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return"),
    completed: bool = Query(None, description="Filter by completion status"),
    db: Session = Depends(get_db),
):
    """
    List items with pagination and optional filtering.
    
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 100, max: 1000)
    - **completed**: Filter by completion status (optional)
    """
    query = db.query(Item)
    
    # Apply optional filters
    if completed is not None:
        query = query.filter(Item.completed == completed)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    return query.all()


@router.put("/{item_id}", response_model=ItemRead)
def update_item(item_id: int, item: ItemCreate, db: Session = Depends(get_db)):
    """Update an existing item."""
    db_item = db.get(Item, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.title = item.title
    db_item.description = item.description or ""
    db_item.completed = item.completed
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an item."""
    db_item = db.get(Item, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}