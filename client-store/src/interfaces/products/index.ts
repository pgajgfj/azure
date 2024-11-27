export interface IProductItem {
    id: number;
    name: string,
    price: number,
    images: string[],
    categoryName: string,
    categoryId: number,
    description: string,
}

export interface IProductCreate {
    name: string,
    price: number,
    categoryId: number,
    images: File[]|null,
}

export interface IProductImageDesc {
    id: number,
    image: string,
}

export interface IProductEdit {
    id: number;
    name: string;
    price: number;
    categoryId: number;
    images?: File[];
    //removeImages?: string[];
}

export interface IUploadedFile {
    id: number;
    image: string;
    priority: number;
    preview: any;
    url: any;
    originFileObj: File;
    size: number;
    type: string;
    uid: string;
}
