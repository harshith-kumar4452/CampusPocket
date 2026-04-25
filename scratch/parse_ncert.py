import re

def parse_md(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    syllabus = []
    subjects_syllabus = re.findall(r'### \d+\. ([^(|\n]+).*?\n\| Chapter \| Title \|\n\|---\|---\|\n((?:\| \d+ \| .*? \|\n)+)', content, re.S)
    
    for subj_name, table_body in subjects_syllabus:
        subj_name = subj_name.strip()
        rows = table_body.strip().split('\n')
        for row in rows:
            match = re.match(r'\| (\d+) \| (.*?) \|', row)
            if match:
                ch_num, ch_title = match.groups()
                syllabus.append({
                    'subject': subj_name,
                    'chapter': int(ch_num),
                    'title': ch_title.strip()
                })

    ss_syllabus = re.findall(r'#### ([^—\n]+) — .*? \(\d+ Chapters\)\n\| Chapter \| Title \|\n\|---\|---\|\n((?:\| \d+ \| .*? \|\n)+)', content, re.S)
    for subj_name, table_body in ss_syllabus:
        subj_name = f"Social Science - {subj_name.strip()}"
        rows = table_body.strip().split('\n')
        for row in rows:
            match = re.match(r'\| (\d+) \| (.*?) \|', row)
            if match:
                ch_num, ch_title = match.groups()
                syllabus.append({
                    'subject': subj_name,
                    'chapter': int(ch_num),
                    'title': ch_title.strip()
                })

    resources = []
    res_table = re.search(r'## RESOURCES\n\n\| Subject \| Book \| Official NCERT PDF \|\n\|---\|---\|---\|\n((?:\| .*? \| .*? \| .*? \|\n)+)', content, re.S)
    if res_table:
        rows = res_table.group(1).strip().split('\n')
        for row in rows:
            parts = [p.strip() for p in row.split('|') if p.strip()]
            if len(parts) >= 3:
                resources.append({
                    'subject': parts[0],
                    'title': parts[1],
                    'url': parts[2]
                })

    mcqs = []
    mcq_sections = re.findall(r'### ([^—\n]+) — 20 MCQs\n\n\| # \| Question \| A \| B \| C \| D \| Answer \|.*?\n\|---\|---\|---\|---\|---\|---\|---\|.*?\n((?:\| \d+ \| .*? \|\n)+)', content, re.S)
    
    for subj_name, table_body in mcq_sections:
        subj_name = subj_name.strip()
        rows = table_body.strip().split('\n')
        for row in rows:
            parts = [p.strip() for p in row.split('|')]
            if len(parts) >= 8:
                mcqs.append({
                    'subject': subj_name,
                    'question': parts[2],
                    'a': parts[3],
                    'b': parts[4],
                    'c': parts[5],
                    'd': parts[6],
                    'answer': parts[7],
                    'source': parts[8] if len(parts) > 8 else ''
                })

    return syllabus, resources, mcqs

def esc(s):
    if not isinstance(s, str): return s
    return s.replace("'", "''")

syllabus, resources, mcqs = parse_md('C:/Users/harsh/OneDrive/Desktop/campus-pocket/class7_ncert_complete.md')

sql = ""
for s in syllabus:
    sql += f"INSERT INTO public.syllabus_chapters (subject_name, class_level, chapter_number, title) VALUES ('{esc(s['subject'])}', 7, {s['chapter']}, '{esc(s['title'])}');\n"

for r in resources:
    sql += f"INSERT INTO public.subject_resources (subject_name, class_level, title, url) VALUES ('{esc(r['subject'])}', 7, '{esc(r['title'])}', '{r['url']}');\n"

for m in mcqs:
    sql += f"INSERT INTO public.mcq_questions (subject_name, class_level, question, option_a, option_b, option_c, option_d, correct_answer, source) VALUES ('{esc(m['subject'])}', 7, '{esc(m['question'])}', '{esc(m['a'])}', '{esc(m['b'])}', '{esc(m['c'])}', '{esc(m['d'])}', '{m['answer']}', '{esc(m['source'])}');\n"

with open('C:/Users/harsh/OneDrive/Desktop/campus-pocket/scratch/insert_ncert_data.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Generated SQL for {len(syllabus)} chapters, {len(resources)} resources, and {len(mcqs)} MCQs.")
