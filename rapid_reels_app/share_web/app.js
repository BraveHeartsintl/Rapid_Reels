function getTokenFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const shareIndex = parts.indexOf("share");
  if (shareIndex >= 0 && parts.length > shareIndex + 1) {
    return parts[shareIndex + 1];
  }
  const queryToken = new URLSearchParams(window.location.search).get("token");
  return queryToken || "";
}

const ui = {
  subtitle: document.getElementById("subtitle"),
  actions: document.getElementById("actions"),
  downloadAllBtn: document.getElementById("downloadAllBtn"),
  roleGate: document.getElementById("roleGate"),
  roleChoiceBtns: document.querySelectorAll(".role-choice-btn"),
  displayNameInput: document.getElementById("displayNameInput"),
  continueBtn: document.getElementById("continueBtn"),
  uploadPanel: document.getElementById("uploadPanel"),
  uploadRoleHint: document.getElementById("uploadRoleHint"),
  uploadInput: document.getElementById("uploadInput"),
  uploadBtn: document.getElementById("uploadBtn"),
  uploadStatus: document.getElementById("uploadStatus"),
  loadingState: document.getElementById("loadingState"),
  emptyState: document.getElementById("emptyState"),
  errorCard: document.getElementById("errorCard"),
  errorDetail: document.getElementById("errorDetail"),
  retryBtn: document.getElementById("retryBtn"),
  gallerySections: document.getElementById("gallerySections"),
  originalGallery: document.getElementById("originalGallery"),
  editedGallery: document.getElementById("editedGallery"),
};

const state = {
  token: "",
  bookingId: "",
  role: "",
  displayName: "",
};

function formatSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatUploadedAt(value) {
  if (!value) return "Unknown upload time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown upload time";
  return date.toLocaleString();
}

function isImage(mimeType) {
  return String(mimeType || "").startsWith("image/");
}

function isVideo(mimeType) {
  return String(mimeType || "").startsWith("video/");
}

function folderLabel(folderType) {
  if (folderType === "original") return "Original";
  if (folderType === "edited") return "Edited";
  return "Media";
}

function setSubtitle(message) {
  ui.subtitle.textContent = message;
}

function hideAllStates() {
  ui.loadingState.classList.add("hidden");
  ui.emptyState.classList.add("hidden");
  ui.errorCard.classList.add("hidden");
}

function showLoadingState() {
  hideAllStates();
  ui.loadingState.classList.remove("hidden");
  ui.actions.classList.add("hidden");
  ui.gallerySections.classList.add("hidden");
}

function showEmptyState() {
  hideAllStates();
  ui.emptyState.classList.remove("hidden");
  ui.gallerySections.classList.add("hidden");
}

function showErrorState(message) {
  hideAllStates();
  ui.errorCard.classList.remove("hidden");
  ui.errorDetail.textContent = message;
  ui.gallerySections.classList.add("hidden");
}

function buildMediaCard(file) {
  const card = document.createElement("article");
  card.className = "media-card";

    const preview = document.createElement("div");
    preview.className = "media-preview";
    if (isImage(file.mimeType) && file.previewUrl) {
      const img = document.createElement("img");
      img.src = file.previewUrl;
      img.alt = file.fileName || "image";
      preview.appendChild(img);
    } else if (isVideo(file.mimeType) && file.previewUrl) {
      const video = document.createElement("video");
      video.src = file.previewUrl;
      video.controls = true;
      video.preload = "metadata";
      preview.appendChild(video);
    } else {
      const fallback = document.createElement("p");
      fallback.className = "preview-fallback";
      fallback.textContent = "Preview unavailable";
      preview.appendChild(fallback);
    }

    const meta = document.createElement("div");
    meta.className = "media-meta";
    const title = document.createElement("p");
    title.className = "media-name";
    title.textContent = file.fileName || "Unnamed file";
    const sub = document.createElement("p");
    sub.className = "media-sub";
    sub.textContent =
      `${formatSize(file.sizeBytes)} - ` +
      `${(file.uploadedByRole || "unknown").toUpperCase()} - ` +
      `${formatUploadedAt(file.uploadedAt)}`;
    const byLine = document.createElement("p");
    byLine.className = "media-sub";
    byLine.textContent =
      file.uploadedById && file.uploadedById.trim()
        ? `Uploaded by ${file.uploadedById.trim()}`
        : `Folder: ${folderLabel(file.folderType)}`;

    const openLink = document.createElement("a");
    openLink.className = "media-link";
    openLink.href = file.downloadUrl || file.previewUrl || "#";
    openLink.target = "_blank";
    openLink.rel = "noopener noreferrer";
    openLink.textContent = "Open file";
    if (!file.downloadUrl && !file.previewUrl) {
      openLink.style.pointerEvents = "none";
      openLink.style.opacity = "0.55";
    }

    meta.appendChild(title);
    meta.appendChild(sub);
    meta.appendChild(byLine);
    meta.appendChild(openLink);

  card.appendChild(preview);
  card.appendChild(meta);
  return card;
}

function renderGallerySections(files) {
  ui.originalGallery.innerHTML = "";
  ui.editedGallery.innerHTML = "";
  const originalFiles = files.filter((file) => file.folderType === "original");
  const editedFiles = files.filter((file) => file.folderType === "edited");
  originalFiles.forEach((file) => ui.originalGallery.appendChild(buildMediaCard(file)));
  editedFiles.forEach((file) => ui.editedGallery.appendChild(buildMediaCard(file)));
  ui.gallerySections.classList.remove("hidden");
}

async function fetchManifest(token) {
  const response = await fetch(`/api/share/manifest?token=${encodeURIComponent(token)}`);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Unable to open share link.");
  }
  return body;
}

async function requestUploadTarget(payload) {
  const response = await fetch("/api/share/upload-target", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Could not prepare upload");
  }
  return body;
}

async function finalizeUpload(payload) {
  const response = await fetch("/api/share/upload-finalize", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Could not finalize upload");
  }
  return body;
}

function bindDownloadButton(token) {
  ui.actions.classList.remove("hidden");
  ui.downloadAllBtn.onclick = () => {
    ui.downloadAllBtn.disabled = true;
    ui.downloadAllBtn.textContent = "Preparing download...";
    window.location.href = `/api/share/download?token=${encodeURIComponent(token)}`;
    setTimeout(() => {
      ui.downloadAllBtn.disabled = false;
      ui.downloadAllBtn.textContent = "Download all as ZIP";
    }, 3000);
  };
}

function updateRoleSelectionUI(selectedRole) {
  ui.roleChoiceBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.roleChoice === selectedRole);
  });
}

function roleCanUpload(role) {
  return role === "provider" || role === "editor";
}

function uploadFolderHint(role) {
  if (role === "provider") return "Uploads go to Original files";
  if (role === "editor") return "Uploads go to Edited files";
  return "View-only role";
}

function getRoleStorageKey(token) {
  return `share_role_${token}`;
}

function loadSavedRoleChoice(token) {
  try {
    const raw = localStorage.getItem(getRoleStorageKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      role: String(parsed.role || ""),
      displayName: String(parsed.displayName || ""),
    };
  } catch (_) {
    return null;
  }
}

function saveRoleChoice(token, role, displayName) {
  localStorage.setItem(
    getRoleStorageKey(token),
    JSON.stringify({role, displayName}),
  );
}

function showRoleSpecificUI() {
  ui.actions.classList.remove("hidden");
  if (roleCanUpload(state.role)) {
    ui.uploadPanel.classList.remove("hidden");
    ui.uploadRoleHint.textContent = uploadFolderHint(state.role);
  } else {
    ui.uploadPanel.classList.add("hidden");
  }
}

async function uploadSelectedFiles() {
  const files = Array.from(ui.uploadInput.files || []);
  if (!files.length) {
    ui.uploadStatus.textContent = "Select at least one image/video file.";
    return;
  }
  if (!roleCanUpload(state.role)) {
    ui.uploadStatus.textContent = "Upload not allowed for current role.";
    return;
  }
  ui.uploadBtn.disabled = true;
  ui.uploadStatus.textContent = `Uploading ${files.length} file(s)...`;
  try {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const target = await requestUploadTarget({
        token: state.token,
        role: state.role,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      const uploadResponse = await fetch(target.uploadUrl, {
        method: "PUT",
        headers: {"Content-Type": file.type},
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }
      await finalizeUpload({
        token: state.token,
        role: state.role,
        storagePath: target.storagePath,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        uploaderId: state.displayName,
      });
      ui.uploadStatus.textContent = `Uploaded ${i + 1}/${files.length}: ${file.name}`;
    }
    ui.uploadStatus.textContent = "All files uploaded successfully.";
    ui.uploadInput.value = "";
    await loadAndRenderManifest();
  } catch (error) {
    ui.uploadStatus.textContent = error.message || "Upload failed.";
  } finally {
    ui.uploadBtn.disabled = false;
  }
}

async function loadAndRenderManifest() {
  showLoadingState();
  const manifest = await fetchManifest(state.token);
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  state.bookingId = manifest.bookingId || "";
  setSubtitle(`Booking ${state.bookingId || ""} - ${files.length} files`);
  hideAllStates();
  if (!files.length) {
    showEmptyState();
  } else {
    renderGallerySections(files);
  }
  bindDownloadButton(state.token);
}

async function init() {
  state.token = getTokenFromPath();
  if (!state.token) {
    setSubtitle("Invalid share link");
    showErrorState("The link does not include a valid share token.");
    return;
  }
  const saved = loadSavedRoleChoice(state.token);
  if (saved && saved.role) {
    state.role = saved.role;
    state.displayName = saved.displayName || "";
    ui.displayNameInput.value = state.displayName;
    updateRoleSelectionUI(state.role);
    ui.roleGate.classList.add("hidden");
    showRoleSpecificUI();
    try {
      await loadAndRenderManifest();
    } catch (error) {
      setSubtitle("Unable to load shared booking");
      showErrorState(error.message || "Failed to load shared media.");
    }
  }
}

ui.roleChoiceBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.role = btn.dataset.roleChoice || "";
    updateRoleSelectionUI(state.role);
  });
});

ui.continueBtn.addEventListener("click", async () => {
  if (!state.role) {
    showErrorState("Please select a role to continue.");
    return;
  }
  state.displayName = ui.displayNameInput.value.trim();
  saveRoleChoice(state.token, state.role, state.displayName);
  ui.roleGate.classList.add("hidden");
  showRoleSpecificUI();
  try {
    await loadAndRenderManifest();
  } catch (error) {
    setSubtitle("Unable to load shared booking");
    showErrorState(error.message || "Failed to load shared media.");
  }
});

ui.uploadBtn.addEventListener("click", () => {
  uploadSelectedFiles();
});

ui.retryBtn.addEventListener("click", () => {
  if (!state.role) {
    ui.roleGate.classList.remove("hidden");
    hideAllStates();
    return;
  }
  loadAndRenderManifest().catch((error) => {
    showErrorState(error.message || "Failed to load shared media.");
  });
});

init();
