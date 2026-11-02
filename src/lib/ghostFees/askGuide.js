// Opens the Ask a ghost chat with a chosen guide (e.g. Cassy) from any screen.
// ResultsView listens for this and switches guide, then opens the chat.
export const ASK_GUIDE = 'ghostfees:ask-guide';

export function askGuide(guide) {
  window.dispatchEvent(new CustomEvent(ASK_GUIDE, { detail: { guide } }));
}
