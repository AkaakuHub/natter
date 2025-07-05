export const getDominantColor = async (image: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      resolve("#ecc24e");
      return;
    }

    const img = new window.Image();
    img.src = image;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      const data = context.getImageData(0, 0, img.width, img.height).data;
      const colorArray = Array.from(data);
      const colorArrayRGB = [];
      for (let i = 0; i < colorArray.length; i += 4) {
        const r = colorArray[i];
        const g = colorArray[i + 1];
        const b = colorArray[i + 2];
        colorArrayRGB.push([r, g, b]);
      }

      const colorArrayRGBSum = colorArrayRGB.reduce(
        (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
        [0, 0, 0],
      );
      const colorArrayRGBAvg = colorArrayRGBSum.map((value) =>
        Math.floor(value / colorArrayRGB.length),
      );
      const [r, g, b] = colorArrayRGBAvg;
      const color = `rgb(${r}, ${g}, ${b})`;
      resolve(color);
    };
  });
};
