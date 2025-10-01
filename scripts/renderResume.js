// Simple JS for tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(this.dataset.tab).classList.add('active');
    });
  });
  
  // redefine global copyEmail with dynamic email (kept)
  window.copyEmail = function () {
    const email = (window.__resumeData && window.__resumeData.email) || "ogle.wyatt28@gmail.com";
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
  
    // ---- Projects: index + detail views ----
    const renderProjectsIndex = (projArr=[]) => {
      const mount = document.getElementById('projects-grid');
      if (!mount) return;
      mount.innerHTML = '';
      projArr.forEach((p, idx) => {
        const a = document.createElement('a');
        a.className = 'project-card';
        a.href = 'javascript:void(0)';
        a.setAttribute('data-idx', idx);
        a.innerHTML = `
          <img src="${p.img || 'images/placeholder.png'}" alt="${p.name}">
          <div class="project-overlay">
            <h3>${p.name}</h3>
            <p>${(p.bullets && p.bullets[0]) || p.description || ''}</p>
          </div>
        `;
        a.addEventListener('click', () => renderProjectDetail(p, projArr));
        mount.appendChild(a);
      });
    };
  
    const renderProjectDetail = (project, allProjects) => {
      const section = document.getElementById('projects');
      if (!section) return;
  
      // Clear the section and render a full-bleed detail view
      section.innerHTML = `
        <div class="project-detail">
          <button class="back-button" id="back-to-projects" aria-label="Back to projects">
            <!-- back arrow -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Back</span>
          </button>
  
          <div class="project-detail-header">
            <img class="project-detail-image" src="${project.img || 'images/placeholder.png'}" alt="${project.name}">
            <div class="project-detail-meta">
              <h2>${project.name}</h2>
              ${project.role ? `<div class="project-role">${project.role}</div>` : ''}
              ${project.tech?.length ? `<div class="project-tech">Tech: ${project.tech.join(', ')}</div>` : ''}
            </div>
          </div>
  
          ${project.bullets?.length ? `<div class="project-detail-bullets">${ul(project.bullets).outerHTML}</div>` : ''}
  
          <div class="project-detail-demo">
            <h3>Demo</h3>
            ${
              project.video
                ? (project.video.includes('youtube.com') || project.video.includes('youtu.be') || project.video.includes('vimeo.com')
                    ? `<div class="video-embed">
                        <iframe src="${project.video}" title="Project demo" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen></iframe>
                      </div>`
                    : `<video src="${project.video}" controls style="width:100%;max-width:900px;"></video>`
                  )
                : `<div class="video-placeholder">No demo provided yet.</div>`
            }
          </div>
        </div>
      `;
  
      // wire back button
      $('#back-to-projects').addEventListener('click', () => {
        // restore the original Projects tab layout
        section.innerHTML = `
          <div class="projects-grid" id="projects-grid"></div>
        `;
        renderProjectsIndex(allProjects);
      });
    };
  
    const renderProjects = (projArr=[]) => {
      // initial grid view
      renderProjectsIndex(projArr);
    };
  
    const renderAbout = (data) => {
      // Description paragraphs
      const descMount = document.getElementById('about-description');
      if (descMount) {
        descMount.innerHTML = '';
        (data.description || []).forEach(p => {
          const par = document.createElement('p');
          par.textContent = p;
          descMount.appendChild(par);
        });
      }
  
      // Skills (inline, same as current)
      const skillsEl = document.getElementById('skills-text');
      if (skillsEl && data.skills?.length) {
        skillsEl.textContent = data.skills.join(', ');
      }
  
      // Interests (inline)
      const interestsEl = document.getElementById('interests-text');
      if (interestsEl && data.interests?.length) {
        interestsEl.textContent = data.interests.join(', ');
      }
  
      // Groups & Involvement (list)
      const groupsUL = document.getElementById('groups-list');
      if (groupsUL) {
        groupsUL.innerHTML = '';
        const combined = [
          ...(data.groups || []),
          ...(data.involvement || [])
        ];
        combined.forEach(g => groupsUL.appendChild(li(g)));
      }
    };
  
    // Fetch JSON (same folder as your HTML)
    let data;
    try {
      const res = await fetch('resume.json', { cache: 'no-cache' });
      data = await res.json();
      window.__resumeData = data; // for copyEmail, etc.
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
      const subtitle = `${uni.school.includes('Washington University') ? 'WashU' : uni.school}${uni.degree ? ' — ' + uni.degree : ''}`.trim();
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
  