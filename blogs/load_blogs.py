import os
import json

OUTPUT_DIRECTORY = os.path.join('public', 'blogs.json')

def load_entries():
    def list_entries(lang):
        directory = os.path.join('blogs', 'entries', lang)
        if not os.path.isdir(directory):
            return []
        return os.listdir(directory)

    zh_hant_entries = list_entries('zh-Hant')
    en_entries = list_entries('en')
    ja_entries = list_entries('ja')
    return {
        'zh-Hant': zh_hant_entries,
        'en': en_entries,
        'ja': ja_entries,
    }

def parse_blog_content(content):
    lines = content.splitlines()
    metadata = {}
    body_lines = []
    in_metadata = False
    content_started = False
    for line in lines:
        if (not content_started) and line.strip() == '---':
            in_metadata = not in_metadata
            if not in_metadata:
                content_started = True
            continue
        if in_metadata:
            if ':' in line:
                key, value = line.split(':', 1)
                try:
                    metadata[key.strip()] = json.loads(value.strip())
                except json.JSONDecodeError:
                    metadata[key.strip()] = value.strip()
                    
        else:
            body_lines.append(line)

    body = '\n'.join(body_lines).strip()
    return metadata, body

def load_blogs():
    entries = load_entries()
    blogs = []
    blogs_by_id = {}
    for lang, files in entries.items():
        for file in files:
            if file.endswith('.md'):
                with open(os.path.join('blogs', 'entries', lang, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    metadata, body = parse_blog_content(content)
                    blogs.append({
                        **metadata,
                        'content': body,
                        'lang': lang
                    })
                    if metadata['id'] not in blogs_by_id:
                        blogs_by_id[metadata['id']] = {}
                    blogs_by_id[metadata['id']][lang] = {
                        **metadata,
                        'content': body,
                        'lang': lang
                    }

    final_blogs = []
    for blog_id, blog_langs in blogs_by_id.items():
        available_langs = list(blog_langs.keys())

        EXCLUDED_FIELDS = ['id', 'date', 'tags', 'author']
        blog = {}
        for field in EXCLUDED_FIELDS:
            blog[field] = blog_langs[available_langs[0]].get(field, None)
        
        EXCLUDED_FIELDS.append('lang')
        for lang in available_langs:
            for field in blog_langs[lang]:
                if field not in EXCLUDED_FIELDS:
                    if field not in blog:
                        blog[field] = {}
                    blog[field][lang] = blog_langs[lang][field]
            
        final_blogs.append(blog)

    return final_blogs

def save_blogs(blogs):
    with open(OUTPUT_DIRECTORY, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, ensure_ascii=False, indent=2)

save_blogs(load_blogs())