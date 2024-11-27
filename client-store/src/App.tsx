import MainLayout from "./components/containers/default";
import {Route, Routes} from "react-router-dom";
import HomePage from "./components/home";
import CategoryCreatePage from "./components/category/create";
import CategoryEditPage from "./components/category/edit";
import ProductListPage from "./components/products/list";
import ProductCreatePage from "./components/products/create";
import ProductEditPage from "./components/products/edit";
import ProductDetailPage from "./components/products/details/ProductDetailPage.tsx";
import PostsList from "./components/post/list";

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="create" element={<CategoryCreatePage />} />
                    <Route path="edit/:id" element={<CategoryEditPage />} />

                    {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
                    {/*<Route path="*" element={<NoMatch />} />*/}

                    {/* PRODUCTS */}
                    <Route path={"products"}>
                        <Route index element={<ProductListPage />} />
                        <Route path="create" element={<ProductCreatePage />} />
                        <Route path="edit/:id" element={<ProductEditPage />} />
                        <Route path="details/:id" element={<ProductDetailPage />} />
                    </Route>

                    <Route path={"posts"}>
                        <Route index element={<PostsList />} />
                    </Route>

                </Route>
            </Routes>
        </>
    )
}
