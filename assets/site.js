/* Local-only reading tools; no analytics and no third-party AI endpoint. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const sidebar = $('#sidebar'), shade = $('#menu-shade'), menu = $('#menu-toggle');
  const mobile = window.matchMedia('(max-width:760px)');
  function syncSidebar(){ sidebar.inert=mobile.matches&&!sidebar.classList.contains('open'); }
  function closeMenu() { sidebar.classList.remove('open'); shade.classList.remove('visible'); menu.setAttribute('aria-expanded','false'); syncSidebar(); }
  syncSidebar(); mobile.addEventListener('change',closeMenu);
  menu?.addEventListener('click', () => { const on=sidebar.classList.toggle('open');shade.classList.toggle('visible',on);menu.setAttribute('aria-expanded',String(on));syncSidebar();if(on)sidebar.querySelector('a').focus(); });
  shade?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => {if(e.key==='Escape' && sidebar.classList.contains('open')) {closeMenu();menu.focus();}});
  document.querySelectorAll('.sidebar a').forEach(a=>a.addEventListener('click',closeMenu));
  const search = $('#search-dialog'), field = $('#search-field'), results = $('#search-results');
  let opener;
  const openSearch = (e) => {opener=e?.currentTarget || document.activeElement;search.showModal();field.focus();};
  document.querySelectorAll('[data-search]').forEach(b=>b.addEventListener('click',openSearch));
  search?.addEventListener('close',()=>opener?.focus());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.addEventListener('keydown',e=>{if((e.key==='/' || ((e.ctrlKey||e.metaKey)&&e.key==='k'))&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();openSearch();}});
  const escape = s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function highlight(s,q){return s.split(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi')).map(t=>t.toLowerCase()===q.toLowerCase()?'<mark>'+escape(t)+'</mark>':escape(t)).join('');}
  field?.addEventListener('input',()=>{
    const q=field.value.trim(),pages=window.COURSE_SEARCH||[];
    if(!q){results.innerHTML='<p class="search-count">输入关键词，在课程讲义中查找概念、问题与方法。</p>';return;}
    const found=pages.map(p=>({...p,pos:(p.title+' '+p.text).toLowerCase().indexOf(q.toLowerCase())})).filter(p=>p.pos>=0).sort((a,b)=>(b.title.includes(q)?1:0)-(a.title.includes(q)?1:0));
    results.innerHTML='<p class="search-count">'+found.length+' 个相关页面</p>'+found.slice(0,30).map(p=>{const at=p.text.toLowerCase().indexOf(q.toLowerCase()),start=Math.max(0,at-38),snippet=p.text.slice(start,start+160);return '<a class="search-result" href="'+escape(p.url)+'"><strong>'+highlight(p.title,q)+'</strong><p>'+(start?'…':'')+highlight(snippet,q)+'…</p></a>';}).join('')+(found.length?'':'<p>未找到相关内容。可尝试更短的关键词，如时代、实践或 AI。</p>');
  });
  const imgDialog=$('#image-dialog'), fullImg=$('#full-image'), fullMechanism=$('#full-mechanism'), viewport=$('#image-scroll'), zoom=$('#image-zoom');
  let imgOpener;
  document.querySelectorAll('.content figure img').forEach(img=>{
    img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','放大图片：'+img.alt);
    const open=()=>{imgOpener=img;fullImg.src=img.src;fullImg.alt=img.alt;const visual=img.closest('.mechanism-visual');fullMechanism.className=visual?visual.className:'mechanism-visual';$('#image-title').textContent='教学图片';viewport.classList.remove('zoomed');zoom.textContent='原始尺寸';imgDialog.showModal();};
    img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
  zoom?.addEventListener('click',()=>{const z=viewport.classList.toggle('zoomed');zoom.textContent=z?'适应窗口':'原始尺寸';});
  imgDialog?.addEventListener('close',()=>imgOpener?.focus());
  const headings=[...document.querySelectorAll('.content h2[id],.content h3[id]')];
  if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{for(const x of entries)if(x.isIntersecting){document.querySelectorAll('.margin-nav a').forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+x.target.id));}},{rootMargin:'-10% 0px -65% 0px'});headings.forEach(h=>obs.observe(h));}
  const originallyClosed=[];
  window.addEventListener('beforeprint',()=>{document.querySelectorAll('.content details:not([open])').forEach(d=>{originallyClosed.push(d);d.open=true;});});
  window.addEventListener('afterprint',()=>{originallyClosed.splice(0).forEach(d=>d.open=false);});
  document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
})();
