from typing import Optional
from sqlmodel import SQLModel, Field

class MedicineBase(SQLModel):
    name: str = Field(index=True, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(MedicineBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = None

class MedicineRead(MedicineBase):
    id: int
