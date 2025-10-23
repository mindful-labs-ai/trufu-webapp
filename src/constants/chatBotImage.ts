export const CHAT_BOT_IMAGE = (botId: number | undefined) => {
  switch (botId) {
    case 1:
      return { src: '/dopo-bottom.gif', alt: 'Dopo' };

    case 2:
      return { src: '/e-book.gif', alt: 'E-book Master' };

    default:
      return false;
  }
};

export const CHAT_BOT_PROFILE = (botId: number | undefined) => {
  switch (botId) {
    case 1:
      return { src: '/dopo-profile.png', alt: 'Dopo' };

    case 2:
      return { src: '/e-book-profile.png', alt: 'E-book Master' };

    case 3:
      return { src: '/trufu-리베-profile.png', alt: 'Rrybe' };

    case 4:
      return { src: '/trufu-치피-profile.png', alt: 'Chpea' };

    default:
      return false;
  }
};
