import {useState, useEffect} from "react";
import {useNavigate, useParams, Link} from "react-router-dom";
import {http_common, API_URL} from '../../../env';
import {Button, Form, Modal, Input, Upload, UploadFile, Space, InputNumber, Select, UploadProps} from "antd";
import {RcFile} from "antd/es/upload";
import {PlusOutlined} from '@ant-design/icons';
import {IProductEdit, IProductItem} from "../../../interfaces/products";
import {ICategoryName} from '../../../interfaces/categories';
import {DndContext, DragEndEvent, PointerSensor, useSensor} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import DraggableUploadListItem from "../../common/DraggableUploadListItem.tsx";

const ProductEditPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm<IProductEdit>();
    const [files, setFiles] = useState<UploadFile[]>([]);

    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [categories, setCategories] = useState<ICategoryName[]>([]);

    //Весь код, який робить переміщення
    const sensor = useSensor(PointerSensor, {
        activationConstraint: {distance: 10},
    });

    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (active.id !== over?.id) {
            setFiles((prev) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const handleChangeFiles: UploadProps["onChange"] = ({fileList: newFileList}) => {
        setFiles(newFileList);
    };

    const uploadButton = (
        <button style={{border: 0, background: "none"}} type="button">
            <PlusOutlined/>
            <div style={{marginTop: 8}}>Upload</div>
        </button>
    );


    useEffect(() => {
        http_common.get<ICategoryName[]>("/api/Categories/names")
            .then(resp => {
                setCategories(resp.data);
            });
    }, []);

    useEffect(() => {
        http_common.get<IProductItem>(`/api/products/${id}`)
            .then(resp => {
                console.log("API Response: ", resp.data);
                const {data} = resp;
                form.setFieldsValue({
                    name: data.name,
                    categoryId: data.categoryId,
                    price: data.price,
                    id: data.id,
                });
                const newFileList: UploadFile[] = [];
                for (let i = 0; i < data.images.length; i++) {
                    newFileList.push({
                        // uid: data.images[i],
                        // name: data.images[i],
                        status: "done",
                        originFileObj: new File([new Blob([''])], data.images[i], { type: 'old-image' }),
                        url: `${API_URL}/images/1200_${data.images[i]}`,
                    } as UploadFile);
                }
                setFiles(newFileList);

            })
            .catch(error => {
                console.error("Error fetching product details:", error);
            });
    }, []);


    const onSubmit = async (values: IProductEdit) => {

        try {
            console.log("files", files);
            console.log("values", values);
            const updatedProduct: IProductEdit = {
                price: values.price,
                name: values.name,
                categoryId: values.categoryId,
                images: files
                    //.filter(file => file.originFileObj)
                    .map(file => file.originFileObj as RcFile),
                //removeImages: removeFiles,
                id: Number(id),
            };
            console.log("upload product", updatedProduct);

            console.log("Send model", updatedProduct);
            const resp = await http_common.put<IProductEdit>(`/api/products`,
                updatedProduct, {
                    headers: {"Content-Type": "multipart/form-data"}
                });

             console.log("Product updated: ", resp.data);
            navigate('/products');
        } catch (error) {
            console.error("Error updating product: ", error);
        }
    };

    const categoriesData = categories.map(item => ({
        label: item.name,
        value: item.id
    }));

    return (
        <>
            <p className="text-center text-3xl font-bold mb-7">Edit Product</p>
            <Form form={form} onFinish={onSubmit} labelCol={{span: 6}} wrapperCol={{span: 14}}>
                <Form.Item name="name" label="Name" hasFeedback
                           rules={[{required: true, message: 'Please provide a valid category name.'}]}>
                    <Input placeholder='Type category name'/>
                </Form.Item>

                <Form.Item name="price" label="Price" hasFeedback
                           rules={[{required: true, message: 'Please enter product price.'}]}>
                    <InputNumber addonAfter="$" placeholder='0.00'/>
                </Form.Item>

                <Form.Item name="categoryId" label="Category" hasFeedback
                           htmlFor={"categoryId"}
                           rules={[{required: true, message: 'Please choose the category.'}]}>
                    <Select placeholder="Select a category" options={categoriesData}/>
                </Form.Item>

                <Form.Item label="Фото">
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext
                            items={files.map((i) => i.uid)}
                            strategy={horizontalListSortingStrategy}
                        >
                            <Upload
                                // showUploadList={{ showPreviewIcon: false }}
                                beforeUpload={() => false}
                                accept="image/*"
                                listType="picture-card"
                                multiple
                                fileList={files}
                                onChange={handleChangeFiles}
                                itemRender={(originNode, file) => (
                                    <DraggableUploadListItem originNode={originNode} file={file}/>
                                )}
                                onPreview={(file: UploadFile) => {
                                    if (!file.url && !file.preview) {
                                        file.preview = URL.createObjectURL(file.originFileObj as RcFile);
                                    }
                                    setPreviewImage(file.url || (file.preview as string));
                                    setPreviewOpen(true);
                                    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
                                }}>
                                {files.length >= 8 ? null : uploadButton}
                            </Upload>
                        </SortableContext>
                    </DndContext>
                </Form.Item>


                {/*<Form.Item name="images" label="Photo" valuePropName="Image"*/}
                {/*           rules={[{required: true, message: "Please choose a photo for the product."}]}*/}
                {/*           getValueFromEvent={(e: UploadChangeParam) => {*/}
                {/*               return e?.fileList.map(file => file.originFileObj);*/}
                {/*           }}>*/}

                {/*    <Upload*/}
                {/*        beforeUpload={() => false}*/}
                {/*        accept="image/*"*/}
                {/*        maxCount={10}*/}
                {/*        listType="picture-card" multiple*/}
                {/*        fileList={files}*/}
                {/*        onRemove={handleRemove}*/}
                {/*        onChange={(data) => {*/}
                {/*            setFiles(data.fileList);*/}
                {/*            //console.log("Updated files list: ", data.fileList);*/}
                {/*        }}*/}
                {/*        onPreview={(file: UploadFile) => {*/}
                {/*            if (!file.url && !file.preview) {*/}
                {/*                file.preview = URL.createObjectURL(file.originFileObj as RcFile);*/}
                {/*            }*/}
                {/*            setPreviewImage(file.url || (file.preview as string));*/}
                {/*            setPreviewOpen(true);*/}
                {/*            setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));*/}
                {/*        }}>*/}

                {/*        <div>*/}
                {/*            <PlusOutlined/>*/}
                {/*            <div style={{marginTop: 8}}>Upload</div>*/}
                {/*        </div>*/}
                {/*    </Upload>*/}
                {/*</Form.Item>*/}

                <Form.Item wrapperCol={{span: 10, offset: 10}}>
                    <Space>
                        <Link to={"/products"}>
                            <Button htmlType="button"
                                    className='text-white bg-gradient-to-br from-red-400 to-purple-600 font-medium rounded-lg px-5'>Cancel</Button>
                        </Link>
                        <Button htmlType="submit"
                                className='text-white bg-gradient-to-br from-green-400 to-blue-600 font-medium rounded-lg px-5'>Update</Button>
                    </Space>
                </Form.Item>
            </Form>

            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="example" style={{width: '100%'}} src={previewImage}/>
            </Modal>
        </>
    );
};

export default ProductEditPage;
