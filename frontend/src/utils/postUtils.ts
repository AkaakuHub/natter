export const formatDate = (date: string | number | Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("ja-JP", options).format(new Date(date));
};

export const getImageUrl = (image: string): string => {
  const isFullUrl = image.startsWith("http://") || image.startsWith("https://");
  return isFullUrl
    ? image
    : `${process.env.NEXT_PUBLIC_API_URL}/posts/images/${image}`;
};
