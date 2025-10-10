import pandas as pd
from io import BytesIO

def parse_members_file(file):
    file_content = file.read()
    file_obj = BytesIO(file_content)

    if file.filename.endswith('.csv'):
        df = pd.read_csv(file_obj)
    elif file.filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(file_obj)
    else:
        raise ValueError('Unsupported file format. Use CSV or XLSX.')

    required_columns = ['firstName', 'lastName', 'pfNumber']
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise ValueError(f'Missing required columns: {", ".join(missing_columns)}')

    members = []
    for _, row in df.iterrows():
        member_data = {
            'first_name': str(row['firstName']).strip(),
            'last_name': str(row['lastName']).strip(),
            'pf_number': str(row['pfNumber']).strip(),
            'department': str(row.get('department', '')).strip() if pd.notna(row.get('department')) else None,
            'phone_number': str(row.get('phoneNumber', '')).strip() if pd.notna(row.get('phoneNumber')) else None,
        }
        members.append(member_data)

    return members

def export_attendance_to_excel(seminar, registered_members, attendance_records):
    # Group attendance by member_id and day
    attendance_map = {}
    for record in attendance_records:
        if record.member_id not in attendance_map:
            attendance_map[record.member_id] = set()
        attendance_map[record.member_id].add(record.day)

    # Build data rows
    data = []
    for member in sorted(registered_members, key=lambda m: m.pf_number):
        row = {
            'PF Number': member.pf_number,
            'First Name': member.first_name,
            'Last Name': member.last_name,
            'Department': member.department or '',
            'Phone': member.phone_number or '',
        }

        # Add day columns
        member_attendance = attendance_map.get(member.id, set())
        for day in range(1, seminar.number_of_days + 1):
            row[f'Day {day}'] = 'Yes' if day in member_attendance else 'No'

        data.append(row)

    df = pd.DataFrame(data)
    output = BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)

    return output
