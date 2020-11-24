# Running this as a command didn't work, but running it manually in the shell did.
import csv
from backend.models import TtsEntry

with open('data_aug27.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        obj, created = TtsEntry.objects.get_or_create(
            customer_number=row['customer_number'],
            day_part=row['day_part'],
            first_seen_local=row['first_seen_local'],
            first_seen_utc=row['first_seen_utc'],
            misc_id=row['id'],
            location=row['location'],
            model_id=row['model_id'],
            total_time_to_service=row['tts'],
        )

