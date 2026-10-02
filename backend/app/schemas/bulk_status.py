from pydantic import BaseModel, Field, model_validator


class BulkStatusChange(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def unique_positive_ids(self):
        if any(row_id <= 0 for row_id in self.ids) or len(set(self.ids)) != len(self.ids):
            raise ValueError("IDs must be positive and unique")
        return self
