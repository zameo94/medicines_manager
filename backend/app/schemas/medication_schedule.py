from datetime import time, date
from typing import Optional, List
from sqlmodel import SQLModel, Field
from .medicine import MedicineRead
from sqlalchemy import Column, JSON
from pydantic import field_validator, model_validator

"""
The schedule system has been created ot handle all the possibilities: every day, once in a month, every 2 days, etc,
following this example:
  ┌───────────────────────────-─┬───────────┬──────────┬──────────────┬──────────────┐
  │ Caso                        │ frequency │ interval │ days_of_week │ day_of_month │
  ├──────────────────────────-──┼───────────┼──────────┼──────────────┼──────────────┤
  │ Every day                   │ DAILY     │ 1        │ None         │ None         │
  │ Every 2 day.                │ DAILY     │ 2        │ None         │ None         │
  │ Every Monday                │ WEEKLY    │ 1        │ 0            │ None         │
  │ Mon-Wen-Fri every week      │ WEEKLY    │ 1        │ 0,2,4        │ None         │
  │ Tuesday every 2 weeks       │ WEEKLY    │ 2        │ 1            │ None         │
  │ 15th every month            │ MONTHLY   │ 1        │ None         │ 15           │
  └────────────────────────────-┴───────────┴──────────┴──────────────┴──────────────┘
"""

class MedicationScheduleBase(SQLModel):
    scheduled_time: time = Field(index=True)
    medicine_id: int = Field(foreign_key='medicines.id', ondelete='CASCADE')
    frequency: str = Field(default='DAILY')
    interval: int = Field(default=1)
    days_of_week: Optional[List[int]] = Field(default=None, sa_column=Column(JSON))
    day_of_month: Optional[int] = Field(default=None)
    start_date: date = Field(default_factory=date.today)

    @field_validator('days_of_week')
    @classmethod
    def validate_days(cls, value):
        if value is not None:
            if not all(0 <= day <= 6 for day in value):
                raise ValueError('I giorni della settimana devono essere tra 0 (Lunedì) e 6 (Domenica)')
        return value
    
    @field_validator('day_of_month')
    @classmethod
    def validate_month_day(cls, value):
        if value is not None:
            if not (1 <= value <= 31):
                raise ValueError('Il giorno del mese deve essere tra 1 e 31')
        return value
    
    @field_validator('interval')
    @classmethod
    def validate_interval(cls, value):
        if value < 1:
            raise ValueError('Intervallo deve essere un numero positivo (> 0)')
        return value
    
    @field_validator('frequency')
    @classmethod
    def validate_frequency(cls, value):
        valid_words = ['DAILY', 'WEEKLY', 'MONTHLY']
        if value not in valid_words:
            raise ValueError(f'Frequenza non valida. Usa: {", ".join(valid_words)}')
        return value
    
    @model_validator(mode='after')
    def validate_start_date_alignement(self):
        if self.frequency == 'MONTHLY' and self.day_of_month:
            if self.start_date.day != self.day_of_month:
                # Handle special case for 31st vs end of month
                if self.day_of_month == 31:
                    import calendar
                    _, last_day = calendar.monthrange(self.start_date.year, self.start_date.month)
                    if self.start_date.day == last_day:
                        return self
                raise ValueError(f'La data di inizio deve coincidere con il giorno del mese scelto ({self.day_of_month})')
        
        if self.frequency == 'WEEKLY' and self.days_of_week:
            if self.start_date.weekday() not in self.days_of_week:
                raise ValueError('La data di inizio deve coincidere con uno dei giorni della settimana scelti')
        
        return self

class MedicationScheduleCreate(MedicationScheduleBase):
    pass

class MedicationScheduleUpdate(MedicationScheduleBase):
    scheduled_time: Optional[time] = None
    medicine_id: Optional[int] = None

class MedicationScheduleRead(MedicationScheduleBase):
    id: int
    medicine: MedicineRead
