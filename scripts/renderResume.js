(async function () {
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  
    // Helpers
    const setText = (id, text) => { const el = document.getElementById(id); if (el && text) el.textContent = text; };
    const setLink = (id, href, textOverride) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!href) { return; }
      el.href = href;
      const txt = document.getElementById(id.replace('-link','-text'));
      if (txt) txt.textContent = textOverride || href.replace(/^https?:\/\//,'');
    };
    const li = (t) => {
      const el = document.createElement('li');
      if (t instanceof Node) el.appendChild(t);
      else el.innerHTML = t; // allow <b>Relevant Coursework:</b> to render
      return el;
    };
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
      if (bullets && bullets.length) {
        // If there's only one string containing HTML with its own structure, inject it directly (no extra <ul>)
        if (bullets.length === 1 && typeof bullets[0] === 'string' && bullets[0].includes('<p')) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = bullets[0];
          content.appendChild(wrapper);
        } else {
          content.appendChild(ul(bullets));
        }
      }
      return card;
    };
  
    const renderEducation = (eduArr=[]) => {
      const mount = document.getElementById('education-timeline');
      if (!mount) return;
      mount.innerHTML = '';
      eduArr.forEach(e => {
        let html = '';
        if (e.degree) html += `<p><b>Degree:</b> ${e.degree}${e.minors?.length ? `<br><b>Minors:</b> ${e.minors.join(', ')}` : ''}</p>`;
        if (e.gpa) html += `<p><b>GPA:</b> ${e.gpa}</p>`;
        if (e.sat) html += `<p><b>SAT:</b> ${e.sat}</p>`;
        if (e.coursework?.length) {
          html += `<p><b>Relevant Coursework:</b></p><ul>${e.coursework.map(c => `<li>${c}</li>`).join('')}</ul>`;
        }

        const card = makeTimelineCard({
          title: e.school,
          pill: e.years || '',
          subtitle: '',
          bullets: [html] // keep structure consistent with existing card builder
        });
        mount.appendChild(card);
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
            <p>${p.description || ''}</p>
          </div>
        `;
        a.addEventListener('click', () => renderProjectDetail(p, projArr));
        mount.appendChild(a);
      });
    };
  
    const renderProjectDetail = (project, allProjects) => {
      const section = document.getElementById('projects');
      if (!section) return;

      const projectTitle = project.link
        ? `<span class="project-title-link" role="link" tabindex="0" data-link="${project.link}">${project.name}</span>`
        : `<span class="project-title-text">${project.name}</span>`;
  
      // Clear the section and render a full-bleed detail view
      section.innerHTML = `
        <h2 class="subsection-title section-title-primary">Projects</h2>
        <div class="project-detail">
          <div class="project-detail-header">
            <div class="project-detail-meta">
                <div class="project-detail-meta-top">
                    <button class="back-button" id="back-to-projects" aria-label="Back to projects">
                        <!-- back arrow -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        <span class="back-btn-line">Back</span>
                    </button>
                </div>
                <div class="project-detail-meta-bottom">
                <h2>${projectTitle}</h2>
                ${project.role ? `<div class="project-role">${project.role}</div>` : ''}
                ${project.tech?.length ? `<div class="project-tech">Tech: ${project.tech.join(', ')}</div>` : ''}
                </div>
            </div>
            <img class="project-detail-image" src="${project.img || 'images/placeholder.png'}" alt="${project.name}">
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
          <h2 class="subsection-title section-title-primary section-title-tight">Projects</h2>
          <div class="projects-grid" id="projects-grid"></div>
        `;
        renderProjectsIndex(allProjects);
      });

      const projectTitleLink = section.querySelector('.project-title-link');
      if (projectTitleLink) {
        const link = projectTitleLink.getAttribute('data-link');
        const openLink = () => {
          if (!link) return;
          window.open(link, '_blank', 'noopener');
        };
        projectTitleLink.addEventListener('click', openLink);
        projectTitleLink.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLink();
          }
        });
      }
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
    }
  
    // Sections
    renderEducation(data.education);
    renderExperience(data.experience);
    renderLeadership(data.leadership);
    renderProjects(data.projects);
    renderAbout(data);
  
  })();