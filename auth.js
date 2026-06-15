const SUPABASE_URL = "https://rwmtsrbeaqnyicdkfsyr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-QdcrgBBSqa75GTq1f8dqw_Yl7C_ant";
const REMEMBER_ME_STORAGE_KEY = "invisibleincident-remember-me";
const SUPABASE_STORAGE_KEY_PREFIX = "sb-rwmtsrbeaqnyicdkfsyr-auth-token";
const POST_LOGIN_REDIRECT_KEY = "invisibleincident-post-login-redirect";
const PROFILE_ICON_STORAGE_KEY_PREFIX = "invisibleincident-profile-icon";
const EMAIL_OTP_STORAGE_KEY_PREFIX = "invisibleincident-email-otp";
const EMAIL_OTP_EMAIL_STORAGE_KEY_PREFIX = "invisibleincident-email-otp-email";
const MAGIC_LINK_COOLDOWN_STORAGE_KEY = "invisibleincident-magic-link-cooldown-until";
const ACCOUNT_CREATION_CONSUMED_STORAGE_KEY = "invisibleincident-account-creation-consumed";
const SOCIAL_HOME_REDIRECT_STORAGE_KEY_PREFIX = "invisibleincident-social-home-redirect";
const EMAIL_OTP_WINDOW_MS = 5 * 60 * 1000;
const MAGIC_LINK_COOLDOWN_MS = 60 * 1000;
const PASSWORD_REQUIREMENT_MESSAGE = "Use at least 8 characters with lowercase, uppercase, number, and special character.";
let emailOtpTimerId = null;
let magicLinkCooldownTimerId = null;
let currentSessionUser = null;

function shouldRememberSession() {
  try {
    const storedPreference = window.localStorage.getItem(REMEMBER_ME_STORAGE_KEY);

    if (storedPreference === "true") return true;
    if (storedPreference === "false") return false;

    return hasPersistentAuthSession();
  } catch (_error) {
    return false;
  }
}

function setRememberMePreference(remember) {
  try {
    window.localStorage.setItem(REMEMBER_ME_STORAGE_KEY, remember ? "true" : "false");
  } catch (_error) {
  }
}

function hasPersistentAuthSession() {
  try {
    return Object.keys(window.localStorage).some((key) =>
      key.startsWith(SUPABASE_STORAGE_KEY_PREFIX)
    );
  } catch (_error) {
    return false;
  }
}

function updateCredentialAutofillBehavior() {
  if (!emailInput || !passwordInput) return;

  const shouldRemember = rememberMeInput?.checked ?? false;

  emailInput.setAttribute("autocomplete", shouldRemember ? "email" : "off");
  passwordInput.setAttribute("autocomplete", shouldRemember ? "current-password" : "new-password");

  if (!shouldRemember) {
    emailInput.value = "";
    passwordInput.value = "";
  }
}

const authStorage = {
  getItem(key) {
    try {
      const storage = shouldRememberSession() ? window.localStorage : window.sessionStorage;
      return storage.getItem(key);
    } catch (_error) {
      return null;
    }
  },
  setItem(key, value) {
    try {
      const storage = shouldRememberSession() ? window.localStorage : window.sessionStorage;
      storage.setItem(key, value);
    } catch (_error) {
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch (_error) {
    }
  },
};

if (!window.supabase) {
  console.error("Supabase client library is missing from the page.");
}

const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    storage: authStorage,
  },
});

const emailLoginForm = document.getElementById("email-login-form");
const magicLinkForm = document.getElementById("magic-link-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const magicEmailInput = document.getElementById("magic-email");
const magicOtpInput = document.getElementById("magic-otp");
const magicLinkSubmit = document.getElementById("magic-link-submit");
const magicOtpConfirm = document.getElementById("magic-otp-confirm");
const rememberMeInput = document.getElementById("remember-me");
const signedOutView = document.getElementById("signed-out-view");
const signedInView = document.getElementById("signed-in-view");
const userEmail = document.getElementById("user-email");
const signoutButton = document.getElementById("signout-button");
const authMessages = Array.from(document.querySelectorAll(".auth-message"));

const googleButton = document.getElementById("google-signin-button");
const emailButton = document.getElementById("email-signin-button");
const profileAvatars = document.querySelectorAll("[data-profile-avatar]");
const profileIconInput = document.getElementById("profile-icon-input");
const profileIconColor = document.getElementById("profile-icon-color");
const profileIconSave = document.getElementById("profile-icon-save");
const profileIconReset = document.getElementById("profile-icon-reset");
const earEmojiSelect = document.getElementById("ear-emoji-select");
const earEmojiCopy = document.getElementById("ear-emoji-copy");
const handEmojiSelect = document.getElementById("hand-emoji-select");
const handEmojiCopy = document.getElementById("hand-emoji-copy");
const brainEmojiSelect = document.getElementById("brain-emoji-select");
const brainEmojiCopy = document.getElementById("brain-emoji-copy");
const lungsEmojiSelect = document.getElementById("lungs-emoji-select");
const lungsEmojiCopy = document.getElementById("lungs-emoji-copy");
const profileFirstName = document.getElementById("profile-first-name");
const profileLastName = document.getElementById("profile-last-name");
const profileUsernamePreview = document.getElementById("profile-username-preview");
const profilePasswordInput = document.getElementById("profile-password-input");
const profilePasswordConfirm = document.getElementById("profile-password-confirm");
const profilePasswordSave = document.getElementById("profile-password-save");
const profilePasswordSection = document.getElementById("profile-password-section");
const profilePasswordToggle = document.getElementById("profile-password-toggle");
const profileDetailsSave = document.getElementById("profile-details-save");
const accountPasswordSection = document.getElementById("account-password-section");
const accountPasswordInput = document.getElementById("account-password-input");
const accountPasswordConfirm = document.getElementById("account-password-confirm");
const accountPasswordSave = document.getElementById("account-password-save");
const profileSectionDivider = document.querySelector(".profile-section-divider");
const passwordStrengthSlot = document.getElementById("password-strength-slot");
const forumNameSection = document.getElementById("forum-name-section");
const forumDisplayCurrent = document.getElementById("forum-display-current");
const forumDisplayFirstName = document.getElementById("forum-display-first-name");
const forumDisplayLastName = document.getElementById("forum-display-last-name");
const forumDisplaySave = document.getElementById("forum-display-save");
const visibleNameWarning = document.getElementById("visible-name-warning");
const profileEmailOtpAddress = document.getElementById("profile-email-otp-address");
const profileEmailOtpCode = document.getElementById("profile-email-otp-code");
const emailOtpSend = document.getElementById("email-otp-send");
const emailOtpVerify = document.getElementById("email-otp-verify");
const emailOtpLink = document.getElementById("email-otp-link");
const emailOtpStatus = document.getElementById("email-otp-status");
const emailOtpCheckbox = document.getElementById("email-otp-checkbox");
const forumPostList = document.getElementById("forum-post-list");

function removeVersionQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);

  if (!params.has("v")) return;

  params.delete("v");

  const cleanSearch = params.toString();
  const cleanUrl =
    window.location.pathname +
    (cleanSearch ? `?${cleanSearch}` : "") +
    window.location.hash;

  window.history.replaceState({}, "", cleanUrl);
}

function getAuthRedirectUrl() {
  const storedRedirect = getRememberedPostLoginRedirect();

  if (storedRedirect) {
    return storedRedirect;
  }

  return getCurrentPageAuthRedirectUrl();
}

function getCurrentPageAuthRedirectUrl() {
  const isLocal =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isProfilePage = window.location.pathname.endsWith("/profile.html");
  const path = isProfilePage ? "profile.html" : "forum-for-discussion.html";

  return isLocal ? `${window.location.origin}/${path}` : `https://invisibleincident.com/${path}`;
}

function getProfileRedirectUrl() {
  const isLocal =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const origin = isLocal ? window.location.origin : "https://invisibleincident.com";

  return `${origin}/profile.html`;
}

function getEmailVerificationLink() {
  return window.location.pathname.includes("/types-of-injury/")
    ? "../email-verification.html"
    : "email-verification.html";
}

function hasAuthTokensInUrl() {
  const hash = window.location.hash || "";
  return hash.includes("access_token=") || hash.includes("refresh_token=");
}

function getAuthErrorFromUrl() {
  const hash = window.location.hash || "";
  const search = window.location.search || "";
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const searchParams = new URLSearchParams(search);
  const params = hashParams.toString() ? hashParams : searchParams;
  const errorCode = params.get("error_code") || params.get("error") || "";
  const errorDescription = params.get("error_description") || "";

  if (!errorCode && !errorDescription) return null;

  return {
    code: errorCode,
    description: errorDescription.replace(/\+/g, " "),
  };
}

function hasAuthErrorInUrl() {
  return Boolean(getAuthErrorFromUrl());
}

function isHomePage() {
  const path = window.location.pathname;
  return path === "/" || path.endsWith("/index.html");
}

function isProfilePage() {
  return window.location.pathname.endsWith("/profile.html");
}

function isAccountPage() {
  return window.location.pathname.endsWith("/account.html");
}

function isProfileOtpValidationPage() {
  return window.location.pathname.endsWith("/profile-otp-validation.html");
}

function getProfileOtpReturnPath() {
  const returnPath = new URLSearchParams(window.location.search).get("return");
  return returnPath === "account.html" || returnPath === "profile.html" ? returnPath : "profile.html";
}

function shouldRedirectAccountToProfileSetup(user) {
  return Boolean(isAccountPage() && (!user || (isEmailAuthUser(user) && !isEmailProfileSetupComplete(user))));
}

function isPasswordModePage() {
  return new URLSearchParams(window.location.search).get("mode") === "password";
}

function isEmailAccountReady(user) {
  if (!user || !isEmailAuthUser(user) || !isEmailProfileSetupComplete(user)) return false;

  const { firstName, lastName } = getProfileNameParts(user);
  const communityUsername = getDefaultForumDisplayName(user);

  return Boolean(firstName && lastName && communityUsername);
}

function shouldRedirectProfileToAccount(user) {
  return Boolean(
    isProfilePage() &&
    user &&
    (!isEmailAuthUser(user) || isEmailAccountReady(user))
  );
}

function prepareOAuthLandingRedirect() {
  if (hasAuthErrorInUrl()) {
    clearStoredAuthState();
    return;
  }

  if (hasAuthTokensInUrl() && isProfilePage()) {
    rememberProfileSetupRedirect();
    return;
  }

  if (!hasAuthTokensInUrl() || !isHomePage()) return;

  try {
    window.localStorage.setItem(POST_LOGIN_REDIRECT_KEY, getAuthRedirectUrl());
  } catch (_error) {
  }
}

function getAuthErrorMessage() {
  const authError = getAuthErrorFromUrl();

  if (!authError) return "";

  const normalizedCode = authError.code.toLowerCase();
  const normalizedDescription = authError.description.toLowerCase();

  if (
    normalizedCode.includes("otp_expired") ||
    normalizedDescription.includes("expired") ||
    normalizedDescription.includes("invalid")
  ) {
    return "This verification link is invalid or has expired. Please request a new OTP / Link.";
  }

  return "Unable to verify this email link. Please request a new OTP / Link.";
}

function markAccountCreationLinkConsumed(session) {
  if (!hasAuthTokensInUrl() || !isProfilePage() || !session?.user?.email) return;

  markAccountCreationConsumed(session.user.email);
  if (magicOtpConfirm) magicOtpConfirm.disabled = true;
}

function rememberPostLoginRedirect() {
  try {
    window.localStorage.setItem(POST_LOGIN_REDIRECT_KEY, getCurrentPageAuthRedirectUrl());
  } catch (_error) {
  }
}

function rememberProfileSetupRedirect() {
  try {
    window.localStorage.setItem(POST_LOGIN_REDIRECT_KEY, getProfileRedirectUrl());
  } catch (_error) {
  }
}

function getRememberedPostLoginRedirect() {
  try {
    return window.localStorage.getItem(POST_LOGIN_REDIRECT_KEY) || "";
  } catch (_error) {
    return "";
  }
}

function redirectAfterLoginIfNeeded(session) {
  if (!session?.user) return;

  try {
    const redirectUrl =
      window.localStorage.getItem(POST_LOGIN_REDIRECT_KEY) ||
      (hasAuthTokensInUrl() && isHomePage() ? getAuthRedirectUrl() : "");

    if (!redirectUrl) return;

    const target = new URL(redirectUrl, window.location.origin);
    const currentPath = window.location.pathname.replace(/\/$/, "/index.html");
    const targetPath = target.pathname.replace(/\/$/, "/index.html");

    if (currentPath === targetPath) {
      window.localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      return;
    }

    window.localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    window.location.replace(target.href);
  } catch (_error) {
  }
}

googleButton?.addEventListener("click", async () => {
  if (!supabaseClient) return;

  rememberPostLoginRedirect();
  const redirectUrl = getCurrentPageAuthRedirectUrl();

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    setMessage("Unable to sign in with Google.", true);
  }
});

emailButton?.addEventListener("click", () => {
  rememberProfileSetupRedirect();
  window.location.href = getEmailVerificationLink();
});

if (
  emailLoginForm &&
  (!emailInput || !passwordInput || !authMessages.length)
) {
  console.error("Email sign-in elements are missing from the page.");
}

if (
  magicLinkForm &&
  (!magicEmailInput || !authMessages.length)
) {
  console.error("Magic link verification elements are missing from the page.");
}

if (rememberMeInput) {
  rememberMeInput.checked = shouldRememberSession();
  updateCredentialAutofillBehavior();
  rememberMeInput.addEventListener("change", () => {
    setRememberMePreference(rememberMeInput.checked);
    updateCredentialAutofillBehavior();
  });
  window.setTimeout(updateCredentialAutofillBehavior, 150);
  window.addEventListener("pageshow", updateCredentialAutofillBehavior);
}

if (signedInView && !signoutButton && window.location.pathname.endsWith("/profile.html")) {
  console.error("Profile sign-out button is missing from the page.");
}

function setMessage(message, isError = false) {
  authMessages.forEach((messageElement) => {
    messageElement.textContent = message;
    messageElement.classList.toggle("auth-message-error", isError);
  });
}

async function copyTextToClipboard(value) {
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_error) {
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } catch (_error) {
    return false;
  } finally {
    textArea.remove();
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getMagicLinkCooldownUntil() {
  try {
    return Number(window.localStorage.getItem(MAGIC_LINK_COOLDOWN_STORAGE_KEY)) || 0;
  } catch (_error) {
    return 0;
  }
}

function setMagicLinkCooldown() {
  const cooldownUntil = Date.now() + MAGIC_LINK_COOLDOWN_MS;

  try {
    window.localStorage.setItem(MAGIC_LINK_COOLDOWN_STORAGE_KEY, String(cooldownUntil));
  } catch (_error) {
  }

  updateMagicLinkSubmitState();
}

function getAccountCreationConsumedEmail() {
  try {
    return window.localStorage.getItem(ACCOUNT_CREATION_CONSUMED_STORAGE_KEY) || "";
  } catch (_error) {
    return "";
  }
}

function markAccountCreationConsumed(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return;

  try {
    window.localStorage.setItem(ACCOUNT_CREATION_CONSUMED_STORAGE_KEY, normalizedEmail);
  } catch (_error) {
  }
}

function clearAccountCreationConsumed() {
  try {
    window.localStorage.removeItem(ACCOUNT_CREATION_CONSUMED_STORAGE_KEY);
  } catch (_error) {
  }
}

function isAccountCreationConsumed(email) {
  const normalizedEmail = normalizeEmail(email);

  return Boolean(normalizedEmail && getAccountCreationConsumedEmail() === normalizedEmail);
}

function getMagicLinkCooldownSeconds() {
  return Math.max(0, Math.ceil((getMagicLinkCooldownUntil() - Date.now()) / 1000));
}

function updateMagicLinkSubmitState(isSubmitting = false) {
  if (!magicLinkSubmit) return;

  const cooldownSeconds = getMagicLinkCooldownSeconds();
  const isCoolingDown = cooldownSeconds > 0;

  magicLinkSubmit.disabled = isSubmitting || isCoolingDown;
  magicLinkSubmit.textContent = isSubmitting
    ? "Sending..."
    : isCoolingDown
      ? `Send OTP / Link (${cooldownSeconds}s)`
      : "Send OTP / Link for account creation";

  if (magicLinkCooldownTimerId) {
    window.clearTimeout(magicLinkCooldownTimerId);
    magicLinkCooldownTimerId = null;
  }

  if (isCoolingDown && !isSubmitting) {
    magicLinkCooldownTimerId = window.setTimeout(updateMagicLinkSubmitState, 1000);
  }
}

function getVerificationErrorMessage(error) {
  const message = error?.message || "";
  const normalizedMessage = message.toLowerCase();
  const status = Number(error?.status) || 0;

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many") ||
    normalizedMessage.includes("email rate limit")
  ) {
    return "Too many verification emails were requested. Please wait a few minutes before trying again.";
  }

  if (
    normalizedMessage.includes("redirect") ||
    normalizedMessage.includes("not allowed") ||
    normalizedMessage.includes("url")
  ) {
    return "Unable to send the verification email. Check the Supabase Auth redirect URL settings.";
  }

  if (
    normalizedMessage.includes("signup") ||
    normalizedMessage.includes("signups")
  ) {
    return "Unable to send the verification email. Email signups are not currently allowed in Supabase Auth.";
  }

  if (
    status >= 500 ||
    normalizedMessage.includes("smtp") ||
    normalizedMessage.includes("email provider") ||
    normalizedMessage.includes("mail")
  ) {
    return "Unable to send the verification email. Check the Supabase custom SMTP settings.";
  }

  return "Unable to send the verification email. Please try again.";
}

function getProfileImageUrl(user) {
  return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
}

function getUserInitial(user) {
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Profile";
  return name.trim().charAt(0).toUpperCase();
}

function normalizeProfileIconValue(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";

  if (window.Intl?.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const firstSegment = Array.from(segmenter.segment(trimmedValue))[0]?.segment || "";

    return firstSegment.length === 1 ? firstSegment.toUpperCase() : firstSegment;
  }

  const codePoints = Array.from(trimmedValue);
  const firstIcon = codePoints[0] || "";
  const secondIcon = codePoints[1] || "";
  const isSkinToneModifier = /[\u{1F3FB}-\u{1F3FF}]/u.test(secondIcon);
  const iconValue = isSkinToneModifier ? `${firstIcon}${secondIcon}` : firstIcon;

  return iconValue.length === 1 ? iconValue.toUpperCase() : iconValue;
}

function getProfileIconStorageKey(user) {
  const userKey = user?.id || user?.email || "anonymous";
  return `${PROFILE_ICON_STORAGE_KEY_PREFIX}:${userKey}`;
}

function getCustomProfileIcon(user) {
  if (!user) return "";

  try {
    const storedIcon = window.localStorage.getItem(getProfileIconStorageKey(user)) || "";

    if (!storedIcon) return "";

    if (!storedIcon.trim().startsWith("{")) {
      return {
        color: "#154c7f",
        letter: normalizeProfileIconValue(storedIcon),
      };
    }

    const parsedIcon = JSON.parse(storedIcon);
    const letter = normalizeProfileIconValue(parsedIcon.letter || "");
    const color = String(parsedIcon.color || "#154c7f");

    return letter ? { color, letter } : "";
  } catch (_error) {
    return "";
  }
}

function clearCustomProfileIcon(user) {
  if (!user) return;

  try {
    window.localStorage.removeItem(getProfileIconStorageKey(user));
  } catch (_error) {
  }
}

function getProfileIconText(user) {
  return getCustomProfileIcon(user)?.letter || getUserInitial(user);
}

function shouldUseProviderProfileImage(user) {
  return Boolean(user && !getCustomProfileIcon(user) && !isEmailAuthUser(user) && getProfileImageUrl(user));
}

function getDisplayedProfileIconText(user) {
  if (!user) return "";

  return getProfileIconText(user);
}

function getDisplayedProfileIconColor(user) {
  return getCustomProfileIcon(user)?.color || "#154c7f";
}

function getProfileNameParts(user) {
  const metadata = user?.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || "";
  const explicitFirstName = metadata.first_name || metadata.given_name || "";
  const explicitLastName = metadata.last_name || metadata.family_name || "";

  if (explicitFirstName || explicitLastName) {
    return {
      firstName: explicitFirstName,
      lastName: explicitLastName,
    };
  }

  if (fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);

    return {
      firstName: parts.shift() || "",
      lastName: parts.join(" "),
    };
  }

  if (isEmailAuthUser(user)) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  return {
    firstName: user?.email?.split("@")[0] || "",
    lastName: "",
  };
}

function getDefaultForumDisplayName(user) {
  const metadataDisplayName = user?.user_metadata?.forum_display_name;

  if (metadataDisplayName) {
    return metadataDisplayName;
  }

  const { firstName, lastName } = getProfileNameParts(user);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return fullName;
}

function splitForumDisplayName(displayName) {
  const parts = String(displayName || "").trim().split(/\s*-\s*|\s+/).filter(Boolean);

  if (parts.length === 2 && parts[0].toLowerCase() === "n" && parts[1].toLowerCase() === "a") {
    return {
      firstName: "",
      lastName: "",
    };
  }

  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" "),
  };
}

function cleanForumNameParts(firstName, lastName) {
  const cleanFirstName = String(firstName || "").trim();
  const cleanLastName = String(lastName || "").trim();

  if (cleanFirstName.toLowerCase() === "n" && cleanLastName.toLowerCase() === "a") {
    return {
      firstName: "",
      lastName: "",
    };
  }

  return {
    firstName: cleanFirstName,
    lastName: cleanLastName,
  };
}

function getForumDisplayName(firstName, lastName) {
  const cleanName = cleanForumNameParts(firstName, lastName);

  return [cleanName.firstName, cleanName.lastName].filter(Boolean).join("-");
}

function getProviderDefaultForumDisplayName(user) {
  const metadataDisplayName = String(user?.user_metadata?.forum_display_name || "").trim();

  if (metadataDisplayName) {
    return metadataDisplayName;
  }

  const { firstName, lastName } = getProfileNameParts(user);

  return [firstName, lastName].map((value) => String(value || "").trim()).filter(Boolean).join("-");
}

function normalizeNameForSafety(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function hasVulgarForumName(firstName, lastName) {
  const normalizedName = normalizeNameForSafety(`${firstName}${lastName}`);
  const blockedTerms = [
    "asshole",
    "bitch",
    "bullshit",
    "cocksucker",
    "cunt",
    "dick",
    "douche",
    "faggot",
    "fuck",
    "motherfucker",
    "nigger",
    "pussy",
    "shit",
    "slut",
    "whore",
  ];

  return blockedTerms.some((term) => normalizedName.includes(term));
}

function getAuthProvider(user) {
  return user?.app_metadata?.provider || user?.app_metadata?.providers?.[0] || "email";
}

function isEmailAuthUser(user) {
  return getAuthProvider(user) === "email";
}

function isGoogleAuthUser(user) {
  return getAuthProvider(user) === "google";
}

function getSocialHomeRedirectStorageKey(user) {
  return `${SOCIAL_HOME_REDIRECT_STORAGE_KEY_PREFIX}:${user?.id || user?.email || "anonymous"}`;
}

function hasCompletedSocialHomeRedirect(user) {
  if (!user || isEmailAuthUser(user)) return true;

  if (user.user_metadata?.social_home_redirect_complete) {
    return true;
  }

  try {
    return window.localStorage.getItem(getSocialHomeRedirectStorageKey(user)) === "true";
  } catch (_error) {
    return false;
  }
}

function markSocialHomeRedirectComplete(user) {
  if (!user || isEmailAuthUser(user)) return;

  try {
    window.localStorage.setItem(getSocialHomeRedirectStorageKey(user), "true");
  } catch (_error) {
  }

  if (supabaseClient && !user.user_metadata?.social_home_redirect_complete) {
    supabaseClient.auth.updateUser({
      data: {
        social_home_redirect_complete: true,
      },
    });
  }
}

function redirectFirstSocialLoginHome(session) {
  const user = session?.user;

  if (
    !user ||
    !isGoogleAuthUser(user) ||
    hasCompletedSocialHomeRedirect(user)
  ) {
    return false;
  }

  markSocialHomeRedirectComplete(user);

  try {
    window.localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  } catch (_error) {
  }

  if (!isHomePage()) {
    window.location.replace("index.html");
    return true;
  }

  return false;
}

function isEmailProfileSetupComplete(user) {
  return Boolean(user?.user_metadata?.profile_setup_complete);
}

function getPasswordStrengthDetails(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return { label: "Password strength", level: "empty", fill: "0%" };
  }

  if (score <= 2) return { label: "Weak", level: "weak", fill: "28%" };
  if (score <= 4) return { label: "Medium", level: "medium", fill: "64%" };
  return { label: "Strong", level: "strong", fill: "100%" };
}

function getPasswordCriteria(password) {
  return {
    hasMinimumLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasUniqueCharacter: /[^A-Za-z0-9]/.test(password),
  };
}

function isPasswordValid(password) {
  const criteria = getPasswordCriteria(password);

  return (
    criteria.hasMinimumLength &&
    criteria.hasLowercase &&
    criteria.hasUppercase &&
    criteria.hasNumber &&
    criteria.hasUniqueCharacter
  );
}

function updatePasswordStrength() {
  if (!passwordStrengthSlot || !profilePasswordInput) return;

  const strength = getPasswordStrengthDetails(profilePasswordInput.value);
  const strengthLabel = passwordStrengthSlot.querySelector(".password-strength-label");

  passwordStrengthSlot.dataset.strength = strength.level;
  passwordStrengthSlot.style.setProperty("--strength-fill", strength.fill);
  passwordStrengthSlot.setAttribute("aria-label", `Password strength: ${strength.label}`);

  if (strengthLabel) {
    strengthLabel.textContent = strength.label;
  }
}

function updateProfileUsernamePreview() {
  if (!profileUsernamePreview) return;

  profileUsernamePreview.value = getForumDisplayName(
    profileFirstName?.value || "",
    profileLastName?.value || ""
  );
}

function updateCommunityUsernameFields(firstName, lastName) {
  const displayName = getForumDisplayName(firstName, lastName);

  if (profileUsernamePreview) {
    profileUsernamePreview.value = displayName;
  }

  if (forumDisplayCurrent) {
    forumDisplayCurrent.value = displayName;
  }
}

function updateProfileSetupState() {
  updatePasswordStrength();
  updateProfileUsernamePreview();

  if (!profilePasswordSave || !profilePasswordInput || !profilePasswordConfirm) return;

  const password = profilePasswordInput.value;
  const passwordConfirm = profilePasswordConfirm.value;
  const passwordsAreValid = isPasswordValid(password) && password === passwordConfirm;

  profilePasswordConfirm.setCustomValidity(
    passwordConfirm && password !== passwordConfirm ? "The two password fields must match." : ""
  );
  profilePasswordSave.disabled = !passwordsAreValid;
}

function updateAccountPasswordState() {
  if (!accountPasswordSave || !accountPasswordInput || !accountPasswordConfirm) return;

  const password = accountPasswordInput.value;
  const passwordConfirm = accountPasswordConfirm.value;
  const otpIsActive = hasCompletedEmailOtp(currentSessionUser);
  const passwordsAreValid = isPasswordValid(password) && password === passwordConfirm;

  accountPasswordConfirm.setCustomValidity(
    passwordConfirm && password !== passwordConfirm ? "The two password fields must match." : ""
  );
  accountPasswordSave.disabled = !otpIsActive || !passwordsAreValid;
}

function clearProfilePasswordFields() {
  if (profilePasswordInput) profilePasswordInput.value = "";
  if (profilePasswordConfirm) profilePasswordConfirm.value = "";
  updateProfileSetupState();
}

function getEmailOtpStorageKey(user) {
  return user?.id ? `${EMAIL_OTP_STORAGE_KEY_PREFIX}:${user.id}` : "";
}

function getEmailOtpEmailStorageKey(email) {
  return email ? `${EMAIL_OTP_EMAIL_STORAGE_KEY_PREFIX}:${email.toLowerCase()}` : "";
}

function readStoredJson(key) {
  if (!key) return null;

  try {
    return JSON.parse(window.localStorage.getItem(key) || "null");
  } catch (_error) {
    return null;
  }
}

function writeStoredJson(key, value) {
  if (!key) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
  }
}

function removeStoredValue(key) {
  if (!key) return;

  try {
    window.localStorage.removeItem(key);
  } catch (_error) {
  }
}

function getEmailOtpState(user) {
  return readStoredJson(getEmailOtpStorageKey(user));
}

function getEmailOtpEmailState(email) {
  return readStoredJson(getEmailOtpEmailStorageKey(email));
}

function isEmailOtpStateActive(state) {
  return Boolean(state?.confirmed && Number(state.expiresAt) > Date.now());
}

function hasCompletedEmailOtp(user) {
  const key = getEmailOtpStorageKey(user);
  const state = getEmailOtpState(user);

  if (!state) {
    return false;
  }

  if (!isEmailOtpStateActive(state)) {
    removeStoredValue(key);
    return false;
  }

  return true;
}

function startEmailOtpWindow(email) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + EMAIL_OTP_WINDOW_MS;

  writeStoredJson(getEmailOtpEmailStorageKey(email), {
    confirmed: false,
    email,
    issuedAt,
    expiresAt,
  });
}

function markEmailOtpCompleted(user, email) {
  const emailState = getEmailOtpEmailState(email);
  const expiresAt = Number(emailState?.expiresAt) || Date.now() + EMAIL_OTP_WINDOW_MS;

  if (expiresAt <= Date.now()) {
    removeStoredValue(getEmailOtpEmailStorageKey(email));
    return false;
  }

  const confirmedState = {
    confirmed: true,
    email,
    confirmedAt: Date.now(),
    expiresAt,
  };

  writeStoredJson(getEmailOtpEmailStorageKey(email), confirmedState);

  if (user) {
    writeStoredJson(getEmailOtpStorageKey(user), confirmedState);
  }

  return true;
}

function syncEmailOtpStateForUser(user) {
  if (!user?.email) return false;

  if (hasCompletedEmailOtp(user)) {
    return true;
  }

  const emailState = getEmailOtpEmailState(user.email);

  if (!isEmailOtpStateActive(emailState)) {
    removeStoredValue(getEmailOtpEmailStorageKey(user.email));
    return false;
  }

  writeStoredJson(getEmailOtpStorageKey(user), {
    ...emailState,
    email: user.email,
  });

  return true;
}

function clearEmailOtpStateForUser(user) {
  removeStoredValue(getEmailOtpStorageKey(user));

  if (user?.email) {
    removeStoredValue(getEmailOtpEmailStorageKey(user.email));
  }
}

function getEmailOtpStatusMessage(user) {
  syncEmailOtpStateForUser(user);
  const state = getEmailOtpState(user);

  if (!isEmailOtpStateActive(state)) {
    return "Email OTP not confirmed.";
  }

  return "Email OTP confirmed.";
}

function getEmailOtpRemainingSeconds(user) {
  const state = getEmailOtpState(user);

  if (!isEmailOtpStateActive(state)) return 0;

  return Math.max(0, Math.ceil((Number(state.expiresAt) - Date.now()) / 1000));
}

function formatEmailOtpCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateEmailOtpLinkState(user, isVerified) {
  if (!emailOtpLink) return;

  const remainingSeconds = isVerified ? getEmailOtpRemainingSeconds(user) : 0;

  emailOtpLink.classList.toggle("email-otp-countdown", Boolean(remainingSeconds));
  emailOtpLink.setAttribute("aria-disabled", remainingSeconds ? "true" : "false");
  emailOtpLink.textContent = remainingSeconds
    ? `OTP active ${formatEmailOtpCountdown(remainingSeconds)}`
    : "Verify email OTP";
}

function startEmailOtpCountdown(user) {
  if (emailOtpTimerId) {
    window.clearInterval(emailOtpTimerId);
    emailOtpTimerId = null;
  }

  if (!user) return;

  emailOtpTimerId = window.setInterval(() => {
    const isActive = hasCompletedEmailOtp(user);
    setEmailOtpStatus(getEmailOtpStatusMessage(user), isActive);

    if (!isActive && emailOtpTimerId) {
      window.clearInterval(emailOtpTimerId);
      emailOtpTimerId = null;
    }
  }, 1000);
}

function setEmailOtpStatus(message, isVerified = false) {
  if (emailOtpStatus) {
    emailOtpStatus.textContent = message;
    emailOtpStatus.classList.toggle("is-verified", isVerified);
  }

  updateEmailOtpLinkState(currentSessionUser, isVerified);

  if (emailOtpCheckbox) {
    emailOtpCheckbox.checked = isVerified;
  }

  if (forumDisplaySave) {
    forumDisplaySave.disabled = !isVerified;
  }

  updateAccountPasswordState();
}

function getForumLink() {
  return window.location.pathname.includes("/types-of-injury/")
    ? "../forum-for-discussion.html"
    : "forum-for-discussion.html";
}

function getProfileLink() {
  return window.location.pathname.includes("/types-of-injury/")
    ? "../profile.html"
    : "profile.html";
}

function getAccountLink() {
  return window.location.pathname.includes("/types-of-injury/")
    ? "../account.html"
    : "account.html";
}

function getNavAuthLinks() {
  const explicitLinks = Array.from(document.querySelectorAll("[data-auth-nav-link]"));

  if (explicitLinks.length) {
    return explicitLinks;
  }

  const navItems = Array.from(document.querySelectorAll(".nav-links li"));
  const authItem = navItems.find((item) => item.textContent.trim().toLowerCase() === "log in");

  if (!authItem) {
    return [];
  }

  authItem.innerHTML = `
    <a class="nav-auth-link" href="${getProfileLink()}" data-auth-nav-link aria-label="Log in">
      <span class="nav-profile-avatar" data-auth-avatar aria-hidden="true"></span>
      <span data-auth-label>Log in</span>
    </a>
  `;

  return Array.from(authItem.querySelectorAll("[data-auth-nav-link]"));
}

function getStoredSession() {
  try {
    const storage = shouldRememberSession() ? window.localStorage : window.sessionStorage;
    const matchingKey = Object.keys(storage).find((key) => key.startsWith(SUPABASE_STORAGE_KEY_PREFIX));

    if (!matchingKey) {
      return null;
    }

    const storedAuth = JSON.parse(storage.getItem(matchingKey));
    const user = storedAuth?.user || storedAuth?.currentSession?.user;

    return user ? { user } : null;
  } catch (_error) {
    return null;
  }
}

function clearStoredAuthState() {
  try {
    window.localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(SUPABASE_STORAGE_KEY_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith(SUPABASE_STORAGE_KEY_PREFIX))
      .forEach((key) => window.sessionStorage.removeItem(key));
  } catch (_error) {
  }
}

function updateNavAuthUI(session) {
  const user = session?.user;
  const profileImageUrl = getProfileImageUrl(user);
  const useProviderImage = shouldUseProviderProfileImage(user);

  getNavAuthLinks().forEach((link) => {
    const label = link.querySelector("[data-auth-label]");
    const avatar = link.querySelector("[data-auth-avatar]");

    link.classList.toggle("is-authenticated", Boolean(user));
    link.setAttribute("aria-label", user ? "View profile" : "Log in");
    link.setAttribute("href", user ? getAccountLink() : getProfileLink());

    if (label) {
      label.textContent = user ? "Profile" : "Log in";
    }

    if (!avatar) return;

    avatar.textContent = user && !useProviderImage ? getDisplayedProfileIconText(user) : "";
    avatar.style.backgroundImage = useProviderImage ? `url("${profileImageUrl}")` : "";
    avatar.style.backgroundColor = user && !useProviderImage ? getDisplayedProfileIconColor(user) : "";
    avatar.classList.toggle("has-image", useProviderImage);
  });
}

function updateProfileAvatars(session) {
  const user = session?.user;
  const profileImageUrl = getProfileImageUrl(user);
  const useProviderImage = shouldUseProviderProfileImage(user);

  profileAvatars.forEach((avatar) => {
    avatar.textContent = user && !useProviderImage ? getDisplayedProfileIconText(user) : "";
    avatar.style.backgroundImage = useProviderImage ? `url("${profileImageUrl}")` : "";
    avatar.style.backgroundColor = user && !useProviderImage ? getDisplayedProfileIconColor(user) : "";
    avatar.classList.toggle("has-image", useProviderImage);
  });
}

function updateProfileFields(session) {
  const user = session?.user;
  const { firstName, lastName } = getProfileNameParts(user);
  const isEmailUser = Boolean(user && isEmailAuthUser(user));
  const isEmailSetupComplete = Boolean(user && isEmailUser && isEmailProfileSetupComplete(user));
  const canEditProfileNames = Boolean(user && isEmailUser && isAccountPage());

  if (profileIconInput) {
    profileIconInput.value = user ? getProfileIconText(user) : "";
    profileIconInput.readOnly = false;
    profileIconInput.setAttribute("aria-readonly", "false");
  }

  if (profileIconColor) {
    profileIconColor.value = user ? getDisplayedProfileIconColor(user) : "#154c7f";
  }

  if (profileIconSave) {
    profileIconSave.hidden = false;
  }

  if (profileIconReset) {
    profileIconReset.hidden = !Boolean(user && !isEmailUser && getProfileImageUrl(user));
  }

  if (profileFirstName) {
    profileFirstName.value = firstName;
    profileFirstName.readOnly = Boolean(user && (!canEditProfileNames && (!isEmailUser || isEmailSetupComplete)));
    profileFirstName.setAttribute(
      "aria-readonly",
      user && (!canEditProfileNames && (!isEmailUser || isEmailSetupComplete)) ? "true" : "false"
    );
  }

  if (profileLastName) {
    profileLastName.value = lastName;
    profileLastName.readOnly = Boolean(user && (!canEditProfileNames && (!isEmailUser || isEmailSetupComplete)));
    profileLastName.setAttribute(
      "aria-readonly",
      user && (!canEditProfileNames && (!isEmailUser || isEmailSetupComplete)) ? "true" : "false"
    );
  }

  if (profilePasswordSection) {
    profilePasswordSection.hidden = Boolean(user && (!isPasswordModePage() && (!isEmailUser || isEmailSetupComplete)));
  }

  if (profilePasswordToggle) {
    profilePasswordToggle.hidden = !Boolean(user && isEmailSetupComplete && !isPasswordModePage());
  }

  if (profilePasswordSave) {
    profilePasswordSave.textContent = isEmailSetupComplete ? "Save new password" : "Save profile setup";
  }

  if (profilePasswordToggle && isEmailSetupComplete) {
    profilePasswordToggle.textContent = "Create profile";
  }

  if (accountPasswordSection) {
    accountPasswordSection.hidden = Boolean(!user || !isEmailUser);
  }

  if (signoutButton) {
    signoutButton.hidden = Boolean(user && isEmailUser && !isAccountPage());
  }

  if (profileSectionDivider) {
    profileSectionDivider.hidden = Boolean(user && isEmailUser && !isAccountPage());
  }

  if (forumNameSection) {
    forumNameSection.hidden = Boolean(!user);
  }

  if (visibleNameWarning) {
    visibleNameWarning.hidden = Boolean(user && isEmailUser);
  }

  if (user && (!isEmailUser || isEmailSetupComplete)) {
    clearProfilePasswordFields();
  }

  updateProfileSetupState();
}

async function loadUserForumProfile(session) {
  const user = session?.user;

  if (!user || !supabaseClient) return;

  const hasActiveEmailOtp = syncEmailOtpStateForUser(user);

  setEmailOtpStatus(
    getEmailOtpStatusMessage(user),
    hasActiveEmailOtp
  );
  startEmailOtpCountdown(user);

  if (forumDisplayFirstName && forumDisplayLastName) {
    const defaultName = splitForumDisplayName(getDefaultForumDisplayName(user));
    const defaultDisplayName = getProviderDefaultForumDisplayName(user);
    forumDisplayFirstName.value = defaultName.firstName;
    forumDisplayLastName.value = defaultName.lastName;
    if (forumDisplayCurrent) {
      forumDisplayCurrent.value = defaultDisplayName;
    }
  }

  if (profileEmailOtpAddress && user.email) {
    profileEmailOtpAddress.value = user.email;
  }

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("forum_display_first_name,forum_display_last_name,forum_display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return;
  }

  if ((data?.forum_display_first_name || data?.forum_display_last_name) && forumDisplayFirstName && forumDisplayLastName) {
    const savedName = cleanForumNameParts(data.forum_display_first_name, data.forum_display_last_name);
    forumDisplayFirstName.value = savedName.firstName;
    forumDisplayLastName.value = savedName.lastName;
    updateCommunityUsernameFields(savedName.firstName, savedName.lastName);
  } else if (data?.forum_display_name && forumDisplayFirstName && forumDisplayLastName) {
    const savedName = splitForumDisplayName(data.forum_display_name);
    forumDisplayFirstName.value = savedName.firstName;
    forumDisplayLastName.value = savedName.lastName;
    updateCommunityUsernameFields(savedName.firstName, savedName.lastName);
  }

}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderForumPosts(posts) {
  if (!forumPostList) return;

  if (!posts.length) {
    forumPostList.innerHTML = '<p class="forum-loading">No discussion posts yet.</p>';
    return;
  }

  forumPostList.innerHTML = posts
    .map((post) => {
      const score = Number.isFinite(post.score) ? post.score : 0;
      const commentCount = Number.isFinite(post.comment_count) ? post.comment_count : 0;
      const category = post.category || "Discussion";
      const meta = post.is_pinned ? "Pinned by moderators" : "Shared by community";
      const pinnedClass = post.is_pinned ? " pinned-post" : "";

      return `
        <article class="discussion-post${pinnedClass}">
          <div class="vote-column" aria-label="Post score">
            <button type="button" aria-label="Upvote">+</button>
            <strong>${score}</strong>
            <button type="button" aria-label="Downvote">-</button>
          </div>
          <div class="post-body">
            <p class="post-meta">${escapeHtml(meta)}</p>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.body)}</p>
            <div class="post-actions">
              <span>${commentCount} comments</span>
              <span>${escapeHtml(category)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadForumPosts(session) {
  if (!forumPostList) return;

  if (!session?.user || !supabaseClient) {
    forumPostList.innerHTML = "";
    return;
  }

  forumPostList.innerHTML = '<p class="forum-loading">Loading discussion posts...</p>';

  const { data, error } = await supabaseClient
    .from("forum_posts")
    .select("id,title,body,category,score,comment_count,is_pinned,created_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    forumPostList.innerHTML = '<p class="forum-loading">Unable to load discussion posts.</p>';
    return;
  }

  renderForumPosts(data || []);
}

function updateAuthUI(session) {
  if (hasAuthErrorInUrl()) {
    session = null;
  }

  currentSessionUser = session?.user || null;

  if (redirectFirstSocialLoginHome(session)) {
    return;
  }

  if (shouldRedirectAccountToProfileSetup(session?.user)) {
    window.location.href = "profile.html";
    return;
  }

  if (shouldRedirectProfileToAccount(session?.user)) {
    window.location.href = "account.html";
    return;
  }

  updateNavAuthUI(session);
  updateProfileAvatars(session);
  updateProfileFields(session);
  redirectAfterLoginIfNeeded(session);

  const isSignedIn = Boolean(session?.user);
  const email = session?.user?.email;

  if (isSignedIn) {
    loadUserForumProfile(session);
  }

  if (!signedOutView && !signedInView && !userEmail) return;

  if (signedOutView) {
    signedOutView.hidden = isSignedIn;
    signedOutView.style.display = isSignedIn ? "none" : "";
  }

  if (signedInView) {
    signedInView.hidden = !isSignedIn;
    signedInView.style.display = isSignedIn ? "" : "none";
  }

  if (userEmail) {
    userEmail.textContent = email || "your profile";
  }

  if (isSignedIn) {
    setMessage("");
    loadForumPosts(session);
  } else {
    loadForumPosts(null);
  }
}

async function loadSession() {
  if (hasAuthErrorInUrl()) {
    clearStoredAuthState();
    updateAuthUI(null);
    setMessage(getAuthErrorMessage(), true);
    return;
  }

  if (!supabaseClient) {
    updateAuthUI(getStoredSession());
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    setMessage("Unable to check your login status. Please try again.", true);
    return;
  }

  updateAuthUI(data.session || getStoredSession());
}

async function refreshSession() {
  if (hasAuthErrorInUrl()) {
    clearStoredAuthState();
    updateAuthUI(null);
    return;
  }

  if (!supabaseClient) {
    updateAuthUI(getStoredSession());
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  updateAuthUI(data.session || getStoredSession());
}

profileIconSave?.addEventListener("click", async () => {
  if (!profileIconInput) return;

  const { data } = supabaseClient
    ? await supabaseClient.auth.getSession()
    : { data: { session: getStoredSession() } };
  const session = data.session || getStoredSession();
  const user = session?.user;

  if (!user) return;

  const icon = normalizeProfileIconValue(profileIconInput.value);
  const color = profileIconColor?.value || "#154c7f";

  try {
    if (icon) {
      window.localStorage.setItem(
        getProfileIconStorageKey(user),
        JSON.stringify({ color, letter: icon })
      );
    } else {
      window.localStorage.removeItem(getProfileIconStorageKey(user));
    }
  } catch (_error) {
  }

  updateAuthUI(session);
});

profileIconReset?.addEventListener("click", async () => {
  const { data } = supabaseClient
    ? await supabaseClient.auth.getSession()
    : { data: { session: getStoredSession() } };
  const session = data.session || getStoredSession();
  const user = session?.user;

  if (!user) return;

  clearCustomProfileIcon(user);
  updateAuthUI(session);
});

function bindEmojiCopy(selectElement, copyButton, fallbackEmoji) {
  copyButton?.addEventListener("click", async () => {
    const emoji = selectElement?.value || fallbackEmoji;
    const didCopy = await copyTextToClipboard(emoji);

    setMessage(
      didCopy ? `Copied ${emoji}. Paste it into Profile icon.` : "Unable to copy emoji. Please try again.",
      !didCopy
    );
  });
}

bindEmojiCopy(earEmojiSelect, earEmojiCopy, "👂");
bindEmojiCopy(handEmojiSelect, handEmojiCopy, "🖐️");
bindEmojiCopy(brainEmojiSelect, brainEmojiCopy, "🧠");
bindEmojiCopy(lungsEmojiSelect, lungsEmojiCopy, "🫁");

emailOtpSend?.addEventListener("click", async () => {
  if (!supabaseClient || !profileEmailOtpAddress) return;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData.session?.user || getStoredSession()?.user;
  const email = normalizeEmail(currentUser?.email || profileEmailOtpAddress.value);

  if (!email) {
    setMessage("Enter an email address before requesting a one-time code.", true);
    return;
  }

  if (!isValidEmail(email)) {
    setMessage("Please enter a valid email address.", true);
    return;
  }

  profileEmailOtpAddress.value = email;

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    setMessage(`Unable to send email OTP: ${error.message}`, true);
    return;
  }

  startEmailOtpWindow(email);
  setMessage("Email OTP sent.");
  setEmailOtpStatus("Email OTP sent. Enter the code to confirm your update window.");
});

emailOtpVerify?.addEventListener("click", async () => {
  if (!supabaseClient || !profileEmailOtpAddress || !profileEmailOtpCode) return;

  const email = normalizeEmail(profileEmailOtpAddress.value);
  const token = profileEmailOtpCode.value.trim();

  if (!email || !token) {
    setMessage("Enter your email address and one-time code.", true);
    return;
  }

  profileEmailOtpAddress.value = email;

  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    setMessage(`Unable to confirm email OTP: ${error.message}`, true);
    return;
  }

  const session = data.session || (await supabaseClient.auth.getSession()).data.session;
  const user = session?.user || getStoredSession()?.user;
  const otpConfirmed = markEmailOtpCompleted(user, email);

  if (!otpConfirmed) {
    setMessage("This email OTP window has expired. Send a new code and try again.", true);
    setEmailOtpStatus("Email OTP expired. Send a new code to update your visible name.", false);
    return;
  }

  profileEmailOtpCode.value = "";
  setMessage("Email OTP confirmed.");
  setEmailOtpStatus(getEmailOtpStatusMessage(user), true);
  startEmailOtpCountdown(user);
  loadUserForumProfile(session || getStoredSession());

  if (isProfileOtpValidationPage()) {
    window.location.href = getProfileOtpReturnPath();
  }
});

forumDisplaySave?.addEventListener("click", async () => {
  if (!supabaseClient || !forumDisplayFirstName || !forumDisplayLastName) return;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData.session?.user || getStoredSession()?.user;

  if (!syncEmailOtpStateForUser(currentUser)) {
    setMessage("Confirm an email OTP before updating your visible forum name. Updates are available for 5 minutes after confirmation.", true);
    setEmailOtpStatus(getEmailOtpStatusMessage(currentUser), false);
    return;
  }

  const firstName = forumDisplayFirstName.value.trim();
  const lastName = forumDisplayLastName.value.trim();

  if (!firstName || !lastName) {
    setMessage("Enter both first and last name for your visible forum name.", true);
    return;
  }

  if (hasVulgarForumName(firstName, lastName)) {
    setMessage("Choose a visible forum name without vulgar language.", true);
    return;
  }

  let { error } = await supabaseClient.rpc("update_forum_display_name", {
    p_first_name: firstName,
    p_last_name: lastName,
  });

  if (error && error.message?.toLowerCase().includes("could not find the function")) {
    const displayName = getForumDisplayName(firstName, lastName);
    const fallbackResult = await supabaseClient
      .from("user_profiles")
      .upsert({
        user_id: currentUser.id,
        forum_display_first_name: firstName.slice(0, 40),
        forum_display_last_name: lastName.slice(0, 40),
        forum_display_name: displayName.slice(0, 80),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    error = fallbackResult.error;
  }

  if (error && error.message?.toLowerCase().includes("could not find the table")) {
    const displayName = getForumDisplayName(firstName, lastName);
    const fallbackResult = await supabaseClient.auth.updateUser({
      data: {
        forum_display_first_name: firstName.slice(0, 40),
        forum_display_last_name: lastName.slice(0, 40),
        forum_display_name: displayName.slice(0, 80),
      },
    });

    error = fallbackResult.error;
  }

  if (error) {
    setMessage(`Unable to update visible forum name: ${error.message}`, true);
    return;
  }

  setMessage("Visible forum name updated.");
  updateCommunityUsernameFields(firstName, lastName);
  clearEmailOtpStateForUser(currentUser);
  setEmailOtpStatus("Email OTP used. Confirm a new OTP to update again.", false);
});

accountPasswordSave?.addEventListener("click", async () => {
  if (!supabaseClient || !accountPasswordInput || !accountPasswordConfirm) return;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData.session?.user || getStoredSession()?.user;
  const password = accountPasswordInput.value;
  const passwordConfirm = accountPasswordConfirm.value;

  if (!currentUser || !isEmailAuthUser(currentUser)) {
    setMessage("Password updates are only available for email sign-ins.", true);
    return;
  }

  if (!syncEmailOtpStateForUser(currentUser)) {
    setMessage("Confirm an email OTP before updating your password. Updates are available for 5 minutes after confirmation.", true);
    setEmailOtpStatus(getEmailOtpStatusMessage(currentUser), false);
    return;
  }

  if (!isPasswordValid(password)) {
    setMessage(PASSWORD_REQUIREMENT_MESSAGE, true);
    return;
  }

  if (password !== passwordConfirm) {
    setMessage("The two password fields must match.", true);
    accountPasswordConfirm.setCustomValidity("The two password fields must match.");
    accountPasswordConfirm.reportValidity();
    return;
  }

  accountPasswordConfirm.setCustomValidity("");

  const { error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    setMessage(`Unable to update password: ${error.message}`, true);
    return;
  }

  accountPasswordInput.value = "";
  accountPasswordConfirm.value = "";
  clearEmailOtpStateForUser(currentUser);
  setEmailOtpStatus("Email OTP used. Confirm a new OTP to update again.", false);
  updateAccountPasswordState();
  setMessage("Password updated. Use your email address and new password next time you log in.");
});

emailOtpLink?.addEventListener("click", (event) => {
  if (emailOtpLink.classList.contains("email-otp-countdown")) {
    event.preventDefault();
  }
});

profilePasswordToggle?.addEventListener("click", () => {
  if (profilePasswordSection) {
    profilePasswordSection.hidden = false;
  }

  if (profilePasswordToggle) {
    profilePasswordToggle.hidden = true;
  }

  if (profilePasswordSave) {
    profilePasswordSave.textContent = "Save new password";
  }

  clearProfilePasswordFields();
  profilePasswordInput?.focus();
});

profilePasswordSave?.addEventListener("click", async () => {
  if (!supabaseClient || !profilePasswordInput || !profilePasswordConfirm) return;

  updateProfileSetupState();

  if (profilePasswordSave.disabled) {
    setMessage(`${PASSWORD_REQUIREMENT_MESSAGE} Make sure both password fields match.`, true);
    profilePasswordConfirm.reportValidity();
    return;
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData.session?.user || getStoredSession()?.user;
  const isPasswordChange = Boolean(currentUser && isEmailProfileSetupComplete(currentUser));

  if (currentUser && !isEmailAuthUser(currentUser)) {
    setMessage("This profile is managed by your sign-in provider.", true);
    return;
  }

  const password = profilePasswordInput.value;
  const passwordConfirm = profilePasswordConfirm.value;
  const firstName = profileFirstName?.value.trim() || "";
  const lastName = profileLastName?.value.trim() || "";

  if (!isPasswordValid(password)) {
    setMessage(PASSWORD_REQUIREMENT_MESSAGE, true);
    return;
  }

  if (password !== passwordConfirm) {
    setMessage("The two password fields must match.", true);
    profilePasswordConfirm.setCustomValidity("The two password fields must match.");
    profilePasswordConfirm.reportValidity();
    return;
  }

  profilePasswordConfirm.setCustomValidity("");

  if (!isPasswordChange && (!firstName || !lastName)) {
    setMessage("Enter both first and last name before saving your profile setup.", true);
    return;
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const communityUsername = getForumDisplayName(firstName, lastName);
  const updatePayload = isPasswordChange
    ? { password }
    : {
        password,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          name: fullName,
          forum_display_name: communityUsername,
          profile_setup_complete: true,
        },
      };

  const { data, error } = await supabaseClient.auth.updateUser(updatePayload);

  if (error) {
    setMessage("Unable to save your profile setup. Please try again.", true);
    return;
  }

  profilePasswordInput.value = "";
  profilePasswordConfirm.value = "";
  updateProfileSetupState();
  updateAuthUI(data.user ? { user: data.user } : getStoredSession());
  setMessage(
    isPasswordChange
      ? "Password updated. Use your email address and new password next time you log in."
      : "Profile setup saved. You can now log in with email and password."
  );
  window.location.href = "forum-for-discussion.html";
});

profileDetailsSave?.addEventListener("click", async () => {
  if (!supabaseClient) return;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData.session?.user || getStoredSession()?.user;

  if (!currentUser) {
    setMessage("Sign in before updating your account.", true);
    return;
  }

  if (!isEmailAuthUser(currentUser)) {
    setMessage("This profile name is managed by your sign-in provider.", true);
    return;
  }

  const firstName = profileFirstName?.value.trim() || "";
  const lastName = profileLastName?.value.trim() || "";

  if (!firstName || !lastName) {
    setMessage("Enter both first and last name before saving account changes.", true);
    return;
  }

  const fullName = [firstName, lastName].join(" ");
  const communityUsername = getForumDisplayName(firstName, lastName);

  const { data, error } = await supabaseClient.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      name: fullName,
      forum_display_name: communityUsername,
      profile_setup_complete: true,
    },
  });

  if (error) {
    setMessage("Unable to save account changes. Please try again.", true);
    return;
  }

  updateAuthUI(data.user ? { user: data.user } : getStoredSession());
  setMessage("Account changes saved.");
});

emailLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) return;

  setMessage("");
  rememberPostLoginRedirect();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeInput?.checked ?? true;
  setRememberMePreference(rememberMe);

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage("Unable to log in. Check your email and password.", true);
    return;
  }

  emailLoginForm.reset();
  if (rememberMeInput) {
    rememberMeInput.checked = rememberMe;
    updateCredentialAutofillBehavior();
  }
  setMessage("Signed in.");
  refreshSession();
});

magicLinkForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient || !magicEmailInput) return;

  setMessage("");

  if (getMagicLinkCooldownSeconds() > 0) {
    updateMagicLinkSubmitState();
    return;
  }

  const email = normalizeEmail(magicEmailInput.value);
  magicEmailInput.value = email;

  if (!isValidEmail(email)) {
    setMessage("Please enter a valid email address.", true);
    return;
  }

  updateMagicLinkSubmitState(true);

  try {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getProfileRedirectUrl(),
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage(getVerificationErrorMessage(error), true);
      updateMagicLinkSubmitState(false);
      return;
    }

    clearAccountCreationConsumed();
    setMessage("OTP / Link sent. Please check your email.");
    setMagicLinkCooldown();
  } catch (_error) {
    setMessage("Unable to send the verification code. Please try again.", true);
    updateMagicLinkSubmitState(false);
  }
});

magicOtpConfirm?.addEventListener("click", async () => {
  if (!supabaseClient || !magicEmailInput || !magicOtpInput) return;

  const email = normalizeEmail(magicEmailInput.value);
  const token = magicOtpInput.value.trim();

  magicEmailInput.value = email;

  if (!isValidEmail(email)) {
    setMessage("Please enter a valid email address.", true);
    return;
  }

  if (!token) {
    setMessage("Enter the one-time code from your email.", true);
    return;
  }

  if (isAccountCreationConsumed(email)) {
    setMessage("This account creation email was already used. Request a new OTP / Link to continue.", true);
    magicOtpConfirm.disabled = true;
    return;
  }

  let { error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    const fallbackResult = await supabaseClient.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    error = fallbackResult.error;
  }

  if (error) {
    setMessage("Unable to confirm the one-time code. Please try again.", true);
    return;
  }

  markAccountCreationConsumed(email);
  if (magicOtpConfirm) magicOtpConfirm.disabled = true;
  setMessage("Email confirmed. Opening your profile setup.");
  window.location.href = "profile.html";
});

signoutButton?.addEventListener("click", async () => {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    setMessage("Unable to sign out. Please try again.", true);
    return;
  }

  clearStoredAuthState();
  updateAuthUI(null);
});

[profileFirstName, profileLastName, profilePasswordInput, profilePasswordConfirm].forEach((field) => {
  field?.addEventListener("input", updateProfileSetupState);
});

[accountPasswordInput, accountPasswordConfirm].forEach((field) => {
  field?.addEventListener("input", updateAccountPasswordState);
});

supabaseClient?.auth.onAuthStateChange((_event, session) => {
  markAccountCreationLinkConsumed(session);
  updateAuthUI(session);
});

removeVersionQueryFromUrl();
prepareOAuthLandingRedirect();
updateMagicLinkSubmitState();
loadSession();
window.addEventListener("focus", refreshSession);
setTimeout(refreshSession, 500);
setTimeout(refreshSession, 1500);
