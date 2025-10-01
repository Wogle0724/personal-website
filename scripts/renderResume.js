
// Simple JS for tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(this.dataset.tab).classList.add('active');
  });
});
// redefine global copyEmail with dynamic email
window.copyEmail = function () {
    const email = (data && data.email) || "ogle.wyatt28@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
      const popup = document.getElementById('copy-popup');
      popup.classList.add('show');
      setTimeout(() => popup.classList.remove('show'), 1200);
    });
  };

  (async function () {
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  
    // Helpers
    const setText = (id, text) => { const el = document.getElementById(id); if (el && text) el.textContent = text; };
    const setLink = (id, href, textOverride) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!href) { el.style.display = 'none'; return; }
      el.href = href;
      const txt = document.getElementById(id.replace('-link','-text'));
      if (txt) txt.textContent = textOverride || href.replace(/^https?:\/\//,'');
    };
    const li = (t) => { const el = document.createElement('li'); el.textContent = t; return el; };
    const ul = (items=[]) => { const u = document.createElement('ul'); items.forEach(i => u.appendChild(li(i))); return u; };
  
    const makeTimelineCard = ({ title, pill, subtitle, bullets }) => {
      const card = document.createElement('div');
      card.className = 'timeline-card';
      card.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-card-content">
          <div class="timeline-card-header">
            <h3>${title}</h3>
            <span class="timeline-pill">${pill || ''}</span>
          </div>
          ${subtitle ? `<span class="position-title">${subtitle}</span>` : ''}
        </div>
      `;
      const content = card.querySelector('.timeline-card-content');
      if (bullets && bullets.length) content.appendChild(ul(bullets));
      return card;
    };
  
    const renderEducation = (eduArr=[]) => {
      const mount = document.getElementById('education-timeline');
      if (!mount) return;
      mount.innerHTML = '';
      eduArr.forEach(e => {
        const bullets = [];
        if (e.degree) bullets.push(e.degree + (e.minors?.length ? `; Minors: ${e.minors.join(', ')}` : ''));
        if (e.gpa) bullets.push(`GPA: ${e.gpa}`);
        if (e.coursework?.length) bullets.push(`Relevant Coursework: ${e.coursework.join(', ')}`);
        if (e.years) bullets.push(`Years: ${e.years}`);
        mount.appendChild(makeTimelineCard({
          title: e.school,
          pill: e.years || '',
          subtitle: '',
          bullets
        }));
      });
    };
  
    const renderExperience = (expArr=[]) => {
      const mount = document.getElementById('work-timeline');
      if (!mount) return;
      mount.innerHTML = '';
      expArr.forEach(xp => {
        mount.appendChild(makeTimelineCard({
          title: xp.company,
          pill: xp.years || '',
          subtitle: xp.title || '',
          bullets: xp.bullets || xp.description || []
        }));
      });
    };
  
    const renderLeadership = (leadArr=[]) => {
      const mount = document.getElementById('leadership-timeline');
      if (!mount) return;
      mount.innerHTML = '';
      leadArr.forEach(ld => {
        mount.appendChild(makeTimelineCard({
          title: ld.organization,
          pill: ld.years || '',
          subtitle: ld.role || '',
          bullets: ld.bullets || []
        }));
      });
    };
  
    const renderProjects = (projArr=[]) => {
      const mount = document.getElementById('projects-grid');
      if (!mount) return;
      mount.innerHTML = '';
      projArr.forEach(p => {
        const a = document.createElement('a');
        a.className = 'project-card';
        a.href = p.link || '#';
        a.target = p.link ? '_blank' : '_self';
        a.innerHTML = `
          <img src="${p.image || 'images/placeholder.png'}" alt="${p.name}">
          <div class="project-overlay">
            <h3>${p.name}</h3>
            <p>${(p.bullets && p.bullets[0]) || p.description || ''}</p>
          </div>
        `;
        mount.appendChild(a);
      });
    };
  
    const renderAbout = (data) => {
      // Groups
      const groupsUL = document.getElementById('groups-list');
      if (groupsUL && data.groups?.length) {
        groupsUL.innerHTML = '';
        data.groups.forEach(g => groupsUL.appendChild(li(g)));
      }
      // Skills (if you want to place them somewhere: add an element with id="skills-text")
      const skillsEl = document.getElementById('skills-text');
      if (skillsEl && data.skills?.length) {
        skillsEl.textContent = data.skills.join(', ');
      }
    };
  
    // Fetch JSON (same folder as your HTML)
    let data;
    try {
      const res = await fetch('resume.json', { cache: 'no-cache' });
      data = await res.json();
    } catch (e) {
      console.error('Failed to load resume.json', e);
      return;
    }
  
    // Top profile
    setText('profile-name', data.name);
    setText('email-text', data.email);
    setText('location-text', data.location);
    setLink('linkedin-link', data.linkedin);
    setLink('github-link', data.github);
  
    // Optional: derive subtitle from first education
    if (data.education?.length) {
      const uni = data.education[0];
      const subtitle = `${uni.school.includes('Washington University') ? 'WashU' : uni.school} ${uni.degree ? '— ' + uni.degree : ''}`.trim();
      setText('subtitle-badge', subtitle);
    }
  
    // Sections
    renderEducation(data.education);
    renderExperience(data.experience);
    renderLeadership(data.leadership);
    renderProjects(data.projects);
    renderAbout(data);
  
    // Update copyEmail to use dynamic email
    window.copyEmail = function () {
      const email = (data && data.email) || "ogle.wyatt28@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        const popup = document.getElementById('copy-popup');
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 1200);
      });
    };
  })();

