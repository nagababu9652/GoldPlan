from pydantic import BaseModel


class ItemBase(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    id: int

    class Config:
        orm_mode = True
