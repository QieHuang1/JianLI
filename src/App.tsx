import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Download, Mail, MapPin, Pause, Phone, Play, X } from 'lucide-react';

type Work = { id: string; title: string; group: string; duration: string; note: string; wide?: boolean };
const groups = ['广告与商业', '口播与访谈', 'Vlog', 'AI 作品'];
const works: Work[] = [
  { id: 'ai-ad', title: 'AI 广告', group: groups[0], duration: '00:30', note: 'AI 视觉与商业表达' },
  { id: 'fashion-ad', title: '信息流 · 服装广告', group: groups[0], duration: '00:15', note: '服装产品的短视频表达' },
  { id: 'snack-ad', title: '信息流 · 零食广告', group: groups[0], duration: '00:14', note: '零食产品的短视频表达' },
  { id: 'talk-1', title: '真人口播 01', group: groups[1], duration: '01:18', note: '口播内容剪辑' },
  { id: 'talk-2', title: '真人口播 02', group: groups[1], duration: '01:44', note: '口播内容剪辑' },
  { id: 'interview', title: '真人访谈', group: groups[1], duration: '00:39', note: '人物对话与观点表达' },
  { id: 'avatar-1', title: '数字人口播 01', group: groups[1], duration: '00:40', note: '数字人内容制作' },
  { id: 'avatar-2', title: '数字人口播 02', group: groups[1], duration: '00:31', note: '数字人内容制作' },
  { id: 'vlog', title: '真人 Vlog', group: groups[2], duration: '01:37', note: '日常记录与叙事剪辑' },
  { id: 'kingdom', title: '女王的胜利王国', group: groups[3], duration: '02:02', note: 'AI 短片创作', wide: true },
  { id: 'heroes', title: '四怪物英雄出场', group: groups[3], duration: '00:15', note: 'AI 角色与影像创作', wide: true },
];
const stats = [ ['140+', '参与制作与发布短视频'], ['3W+', '参与运营账号累计涨粉'], ['270W+', '账号单条最高播放量'], ['110+', '制作口播与 Vlog 样片'] ];
const media = (id: string, type = 'mp4') => `/media/${id}.${type}`;

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

export default function App() {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<Work | null>(null);
  const [playing, setPlaying] = useState(!reduced);
  const [videoError, setVideoError] = useState(false);
  const hero = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);

  useEffect(() => {
    if (!selected) return;
    setVideoError(false);
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; trigger.current?.focus(); };
  }, [selected]);

  useEffect(() => {
    const video = hero.current;
    if (!video) return;
    if (playing && !selected) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [playing, selected]);

  const close = () => dialog.current?.close();
  return <>
    <a href="#works" className="skip-link">跳至作品</a>
    <header className="hero-shell" id="top">
      <div className="hero-frame">
        <video ref={hero} className="hero-video" src={media('hero')} poster={media('hero', 'jpg')} autoPlay={!reduced} loop muted playsInline aria-hidden="true" />
        <div className="hero-shade" /><div className="noise-overlay" />
        <nav aria-label="主导航" className="hero-nav">
          <a href="#about">关于我</a><a href="#experience">工作经历</a><a href="#works">视频作品</a><a href="#contact">联系我</a>
        </nav>
        <div className="hero-topline"><a href="#top" className="wordmark">PCX<span>®</span></a><span>PERSONAL PORTFOLIO / 2026</span></div>
        <div className="hero-middle"><span className="eyebrow">VIDEO EDITING & AI FILMMAKING</span><p>让内容被看见，<br />也被记住。</p></div>
        <div className="hero-content">
          <motion.div initial={reduced ? false : { y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}><p className="hero-role">短视频运营 · 视频剪辑 · AI 影像</p><h1>彭程兴<span className="asterisk">*</span></h1><p className="name-en">PENG CHENGXING</p></motion.div>
          <motion.div className="hero-intro" initial={reduced ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}><p>拥有一年短视频运营实操经验。<br />从选题、剪辑到发布与复盘，<br />用内容思考，也用影像表达。</p><a className="pill-button" href="#works">查看我的作品<span><ArrowRight size={19} /></span></a></motion.div>
        </div>
        <div className="hero-bottom"><a href="#about"><ArrowDown size={15} /> 向下探索</a><span>背景来自个人 AI 短片《女王的胜利王国》</span><button onClick={() => setPlaying(!playing)} aria-label={playing ? '暂停背景视频' : '播放背景视频'}>{playing ? <Pause size={15} /> : <Play size={15} />}</button></div>
      </div>
    </header>

    <main>
      <section id="about" className="section about-section">
        <Reveal className="section-label"><span>01 / ABOUT ME</span><span>关于我</span></Reveal>
        <Reveal className="about-card">
          <span className="eyebrow">CONTENT. CUT. CREATE.</span>
          <h2>我是彭程兴，<br />一名短视频内容创作者。<br /><em className="font-serif">Every frame tells a story.</em></h2>
          <p className="about-copy">参与短视频拍摄、剪辑、文案、发布及账号运营，熟悉内容从制作到发布的完整流程。将 AI 工具应用于选题、文案、视觉生成与视频制作，独立完成 AI 短片创作。</p>
          <div className="profile-line"><img src={media('portrait', 'png')} alt="彭程兴的简历照片" width="68" height="90" loading="lazy" /><div><strong>彭程兴</strong><span>短视频运营实习生</span></div><div className="profile-meta"><span><MapPin size={14} /> 北京市</span><span>郑州经贸学院 · 信息管理与信息系统 · 2027 届本科</span></div><a href={media('resume', 'pdf')} download="彭程兴-实习简历.pdf" className="text-link"><Download size={16} /> 下载简历</a></div>
        </Reveal>
        <Reveal className="stats-grid">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><p>{label}</p></div>)}</Reveal>
        <p className="stats-note">账号数据及工作经历来源于个人简历。</p>
        <div className="experience" id="experience">
          <Reveal className="experience-heading"><span className="eyebrow">EXPERIENCE & TOOLKIT</span><h3>从内容制作，<br />走到账号运营。</h3></Reveal>
          <Reveal className="experience-details"><div className="job-heading"><div><h4>北京星光元气科技有限公司</h4><p>短视频运营实习生</p></div><span>2025.08 — 2026.07</span></div><p>参与「清华陈晶聊商业」日常运营，根据内容数据优化选题方向与视频节奏；了解公域获客、直播筛选与私域承接的内容转化链路。</p><p>完成私董会员短视频 IP 样片剪辑 34 组，负责素材筛选、节奏、字幕、音乐音效，并根据客户反馈修改优化。</p><div className="skills">{['剪映', '达芬奇', 'ChatGPT', 'WorkBuddy', 'LibTV', 'TapNow'].map(skill => <span key={skill}><Check size={12} />{skill}</span>)}</div></Reveal>
        </div>
      </section>

      <section id="works" className="section works-section bg-noise">
        <Reveal className="section-label"><span>02 / SELECTED WORKS</span><span>作品集 · 11 部</span></Reveal>
        <Reveal className="works-heading"><h2>内容有很多种表达。<br /><span>这里是我的一些尝试。</span></h2><p>广告 / 口播 / Vlog / AI 影像</p></Reveal>
        <nav className="category-links" aria-label="作品分类">{groups.map((group, i) => <a key={group} href={`#group-${i}`}><span>0{i + 1}</span>{group}<ArrowDown size={14} /></a>)}</nav>
        {groups.map((group, i) => <div className="work-group" id={`group-${i}`} key={group}><div className="group-heading"><h3>{group}</h3><span>{String(works.filter(w => w.group === group).length).padStart(2, '0')} FILMS</span></div><div className={`works-grid group-${i}`}>{works.filter(w => w.group === group).map((work, index) => <Reveal key={work.id}><button className={`work-card ${work.wide ? 'landscape' : ''}`} onClick={event => { trigger.current = event.currentTarget; setSelected(work); }} aria-label={`播放 ${work.title}`}><div className="poster"><img src={media(work.id, 'jpg')} alt={`${work.title}视频画面`} loading="lazy" width={work.wide ? 800 : 450} height={work.wide ? 450 : 800} /><span className="card-index">0{index + 1}</span><span className="play-circle"><Play size={21} fill="currentColor" /></span><span className="duration">{work.duration}</span></div><div className="card-caption"><div><h4>{work.title}</h4><p>{work.note}</p></div><ArrowUpRight size={20} /></div></button></Reveal>)}</div></div>)}
      </section>
    </main>

    <footer id="contact" className="section contact-section">
      <Reveal className="section-label"><span>03 / LET’S CONNECT</span><span>联系我</span></Reveal>
      <Reveal className="contact-main"><div><p className="eyebrow">短视频运营实习 · 视频内容制作</p><h2>期待下一次，<br /><em className="font-serif">一起创作。</em><span>*</span></h2><a href={media('resume', 'pdf')} className="pill-button" download="彭程兴-实习简历.pdf">下载完整简历<span><Download size={18} /></span></a></div><address><a href="mailto:709750034@qq.com"><span><Mail size={17} /> 邮箱</span><strong>709750034@qq.com</strong><ArrowUpRight size={20} /></a><a href="tel:+8618736536542"><span><Phone size={17} /> 手机</span><strong>187 3653 6542</strong><ArrowUpRight size={20} /></a><div><span><MapPin size={17} /> 所在地</span><strong>北京市</strong></div></address></Reveal>
      <div className="footer-bottom"><span>© 2026 彭程兴 · 个人作品集</span><span>VIDEO / CONTENT / AI</span><a href="#top">回到顶部 ↑</a></div>
    </footer>

    <dialog ref={dialog} className="video-dialog" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="video-title">
      {selected && <div className="dialog-inner"><div className="dialog-heading"><div><span>{selected.group} / {selected.duration}</span><h2 id="video-title">{selected.title}</h2></div><button onClick={close} aria-label="关闭视频"><X size={24} /></button></div>{videoError ? <p className="video-error">视频暂时无法播放，请重新打开或<a href={media(selected.id)} download>下载视频</a>查看。</p> : <video key={selected.id} src={media(selected.id)} poster={media(selected.id, 'jpg')} controls autoPlay playsInline preload="metadata" onError={() => setVideoError(true)} />}<p className="dialog-note">{selected.note}<span>按 Esc 可关闭</span></p></div>}
    </dialog>
  </>;
}
