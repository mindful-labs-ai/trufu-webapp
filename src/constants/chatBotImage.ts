export const CHAT_BOT_IMAGE = (botId: number | undefined) => {
  switch (botId) {
    case 1:
      return { src: '/dopo.gif', alt: 'Dopo' };

    case 2:
      return false; // TODO : 이미지 추가 { src: '/e-book.gif', alt: 'E-book Master' }

    default:
      return false;
  }
};
