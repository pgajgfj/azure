import { Editor, IAllProps } from "@tinymce/tinymce-react";
import classNames from "classnames";
import {FC} from "react";
import {API_URL, http_common} from "../../../env";
import {IProductImageDesc} from "../../../interfaces/products";

//Властивості, які приймає компонент
interface IEditorProps extends IAllProps {
    //тут міститься метод onEditorChange - який відслідковує зміни в едіторі
    label: string; //Назва самого інпута
    field: string; //ідентифікатор інпута
    getSelectImage: (image: IProductImageDesc) => void;
    // error?: string | undefined;
    // touched?: boolean | undefined;
}

const EditorTiny: FC<IEditorProps> = ({
                                          label,
                                          field,
                                          getSelectImage,
                                          // error,
                                          // touched,
                                          ...props //Усі інши параметри, наприклад onEditorChange
                                      }) => {

    return (
        <div className="mb-3">
            <label htmlFor={field} className="form-label">
                {label}
            </label>
            <div
                className={classNames(
                    "form-control",
                    // { "is-invalid border border-4 border-danger": touched && error },
                    // { "is-valid border border-4 border-success": touched && !error }
                )}
            >
                <Editor
                    apiKey="l4ipj5d2e673xkfnuw4xjsxgaqqu4f45uf8qoh4az9o28mzr"
                    // initialValue="<p>This is the initial content of the editor</p>"
                    init={{
                        height: 500, //висота самого інтупа
                        language: "en", //мова панелі
                        menubar: true, //показувать меню
                        images_file_types: "jpg,jpeg", //формати файлі, які можна обирать - фото
                        block_unsupported_drop: false,
                        menu: {
                            file: {
                                title: "File",
                                items: "newdocument restoredraft | preview | print ",
                            },
                            edit: {
                                title: "Edit",
                                items: "undo redo | cut copy paste | selectall | searchreplace",
                            },
                            view: {
                                title: "View",
                                items:
                                    "code | visualaid visualchars visualblocks | spellchecker | preview fullscreen",
                            },
                            insert: {
                                title: "Insert",
                                items:
                                    "image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime",
                            },
                            format: {
                                title: "Format",
                                items:
                                    "bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat",
                            },
                            tools: {
                                title: "Tools",
                                items: "spellchecker spellcheckerlanguage | code wordcount",
                            },
                            table: {
                                title: "Table",
                                items: "inserttable | cell row column | tableprops deletetable",
                            },
                            help: { title: "Help", items: "help" },
                        },
                        plugins: [
                            "image",
                            "advlist autolink lists link image imagetools charmap print preview anchor",
                            "searchreplace visualblocks code fullscreen textcolor ",
                            "insertdatetime media table paste code help wordcount",
                        ],
                        toolbar:
                            "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor ",
                        content_langs: [
                            { title: "English", code: "en" },
                            { title: "Українська", code: "ua" },
                        ],
                        content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        //Дає можливість завантажувать фото на серве
                        //Зявляється кнопка обрати фото
                        file_picker_callback: (cb, _value, _meta) => {
                            const input = document.createElement("input");
                            input.setAttribute("type", "file");
                            input.setAttribute("accept", "image/*");
                            input.addEventListener("change", (e: Event) => {
                                const files = (e.target as HTMLInputElement).files;

                                //Перевіряємо, чи ми обрали файли

                                if (files) {
                                    const file = files[0]; //Обирати можна декільа файлів, але ми беремо 1 файл
                                    //Перевірка на тип обраного файлу - допустимий тип jpeg, png, gif
                                    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
                                    if (!allowedTypes.includes(file.type)) {
                                        alert("Не допустимий тип файлу");
                                        return;
                                    }
                                    // console.log("File select", file);

                                    http_common
                                        .post<IProductImageDesc>("api/products/upload", { image: file },
                                            {
                                                headers: { "Content-Type": "multipart/form-data" }
                                            }) //посилаємо запит на сервер для збереження файлу
                                        .then((resp) => {
                                            const {data} = resp;
                                            getSelectImage(data);
                                            //Якщо результат був усешіний
                                            const fileName =
                                                API_URL + "/images/600_" + data.image; //Формуємо шлях до файлу із розміром файлу 600
                                            cb(fileName); //відображаємо даний шлях у нашому вікні самого editora
                                        });
                                }
                                (e.target as HTMLInputElement).value=""
                                //e.target.value = ""; //скидаємо значення із інпута- щоб він мав пусте значення
                            });

                            input.click(); //клікаємо по інтупу, щоб обрати файл на вашому ПК.
                        },
                    }}
                    //outputFormat="html"
                    //toolbar="code"
                    {...props} //до Eдітора додаємо усі властивості в вказіник onEditorChange
                />
            </div>
            {/*{touched && error && <div className="invalid-feedback">{error}</div>}*/}
        </div>
    );
};

export default EditorTiny;
