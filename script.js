// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Live strip: latest public push from GitHub, so the page always answers
// "what is Hritik building right now" without anyone editing it.
(async function liveStrip() {
  const el = document.getElementById("live-text");
  const fallback = () => {
    el.innerHTML = 'See what I\'m building on <a href="https://github.com/Hritikd">GitHub</a>.';
  };
  try {
    const res = await fetch("https://api.github.com/users/Hritikd/events/public", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return fallback();
    const events = await res.json();
    const push = events.find((e) => e.type === "PushEvent");
    if (!push) return fallback();

    const repo = push.repo.name.replace(/^Hritikd\//, "");
    const hours = Math.max(1, Math.round((Date.now() - new Date(push.created_at)) / 36e5));
    const ago = hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
    const link = `<a href="https://github.com/${push.repo.name}">${repo}</a>`;

    // The events feed no longer carries commit messages; fetch the head commit.
    let detail = "";
    try {
      const c = await fetch(
        `https://api.github.com/repos/${push.repo.name}/commits/${push.payload.head}`
      );
      if (c.ok) {
        const msg = (await c.json()).commit.message.split("\n")[0];
        detail = ` — “${msg.length > 56 ? msg.slice(0, 53) + "…" : msg}”`;
      }
    } catch {
      /* message is a bonus, not a requirement */
    }

    el.innerHTML = `Latest from the workshop: pushed to ${link} ${ago}${detail}`;
  } catch {
    fallback();
  }
})();
