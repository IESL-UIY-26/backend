import ImageKitPkg from '@imagekit/nodejs';

const ImageKitCtor: any = (ImageKitPkg as any)?.default ?? ImageKitPkg;

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY ?? process.env.IMGKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? process.env.IMGKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT ?? process.env.IMGKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
    console.warn('ImageKit not fully configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT');
}

export const imagekit = new ImageKitCtor({
    publicKey: publicKey ?? '',
    privateKey: privateKey ?? '',
    urlEndpoint: urlEndpoint ?? '',
});

export const uploadBuffer = async (buffer: Buffer, fileName: string) => {
    const base64 = buffer.toString('base64');
    return imagekit.files.upload({
        file: base64,
        fileName,
        useUniqueFileName: true,
    });
};

export const deleteFileById = async (fileId: string) => {
    return imagekit.files.delete(fileId);
};
