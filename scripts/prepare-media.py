"""Create web copies of the supplied videos; leave original assets untouched."""
import concurrent.futures
import json
from pathlib import Path
import shutil
import subprocess
import pdfplumber

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE.parent / '作品集'
MEDIA = SITE / 'public' / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)
ITEMS = [
    ('01-广告与商业', 'AI广告', 'ai-ad'),
    ('01-广告与商业', '信息流服装广告', 'fashion-ad'),
    ('01-广告与商业', '信息流零食广告', 'snack-ad'),
    ('02-口播与访谈', '真人口播1', 'talk-1'),
    ('02-口播与访谈', '真人口播2', 'talk-2'),
    ('02-口播与访谈', '真人访谈', 'interview'),
    ('02-口播与访谈', '数字人口播1', 'avatar-1'),
    ('02-口播与访谈', '数字人口播2', 'avatar-2'),
    ('03-Vlog', '真人Vlog', 'vlog'),
    ('04-AI作品', 'AI短片女王的胜利王国', 'kingdom'),
    ('04-AI作品', 'AI短片四怪物英雄出场', 'heroes'),
]

def run(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)

def prepare(item):
    folder, name, slug = item
    source = SOURCE / '02-作品素材' / '视频作品' / folder / f'{name}.mp4'
    run(['-ss', '2', '-i', str(source), '-frames:v', '1', '-vf', 'scale=800:-2', '-q:v', '3', str(MEDIA / f'{slug}.jpg')])
    run(['-i', str(source), '-map', '0:v:0', '-map', '0:a:0?', '-vf', "scale='if(gte(iw,ih),min(1280,iw),min(720,iw))':-2", '-r', '30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '25', '-maxrate', '1300k', '-bufsize', '2600k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', '-threads', '3', str(MEDIA / f'{slug}.mp4')])
    probe = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(MEDIA / f'{slug}.mp4')])
    duration = float(json.loads(probe)['format']['duration'])
    print(json.dumps({'id': slug, 'duration': duration, 'bytes': (MEDIA / f'{slug}.mp4').stat().st_size}), flush=True)

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(prepare, ITEMS))

hero_source = SOURCE / '02-作品素材' / '首屏视频.mp4'
run(['-i', str(hero_source), '-an', '-vf', 'scale=1280:-2', '-r', '30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-maxrate', '2500k', '-bufsize', '5000k', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(MEDIA / 'hero-home.mp4')])
run(['-ss', '2', '-i', str(hero_source), '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '2', str(MEDIA / 'hero-home.jpg')])
resume = SOURCE / '01-个人资料' / '简历' / '彭程兴 实习简历.pdf'
shutil.copy2(resume, MEDIA / 'resume.pdf')
with pdfplumber.open(resume) as pdf:
    pdf.pages[0].crop((24, 23, 92, 113)).to_image(resolution=240).save(str(MEDIA / 'portrait.png'))
print('Media preparation complete.', flush=True)
