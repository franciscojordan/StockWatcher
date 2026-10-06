function playNotificationSound() {
  const soundURL = chrome.runtime.getURL('sounds/notification.mp3');
  const audio = new Audio(soundURL);
  audio.play().catch(error => {
    console.error("Audio playback failed:", error);
  });
}