export const CHAT_BOT_IMAGE = (botId: number | undefined) => {
  switch (botId) {
    case 1:
      return { src: '/dopo.gif', alt: 'Dopo' };

    case 2:
      return { src: '/e-book.gif', alt: 'E-book Master' };

    default:
      return false;
  }
};
