import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import Root from '../src/components/Root'
import Home from '../src/components/Home'
import Register from '../src/components/Register'
import Login from '../src/components/Login'
import UserProfile from '../src/components/UserProfile'
import AuthorProfile from '../src/components/AuthorProfile'
import AdminProfile from '../src/components/AdminProfile'
import Articles from '../src/components/Articles'
import ArticleById from '../src/components/ArticleById'
import WriteArticles from '../src/components/WriteArticles'
import AuthorArticles from '../src/components/AuthorArticles'
import UserList from '../src/components/UserList'
import AuthorList from '../src/components/AuthorList'
import EditArticle from '../src/components/EditArticle'
import { Toaster } from 'react-hot-toast'
import Unauthorized from '../src/components/Unauthorized'
import ProtectedRoute from '../src/components/ProtectedRoute'
import Header from './components/Header'

function App() {
  const routerObj = createBrowserRouter([
    {
      path: '/',
      element: <Root />,
      children: [
        {
          path: '',
          element: <Home />
        },
        {
          path: 'register',
          element: <Register />
        },
        {
          path: 'login',
          element: <Login />
        },
        {
          path: 'user-profile',
          element: (
            <ProtectedRoute allowedRoles={['USER']}>
              <UserProfile />
            </ProtectedRoute>
          )
        },
        {
          path: 'articles',
          element: <Articles />
        },
        {
          path: 'author-profile',
          element: (
            <ProtectedRoute allowedRoles={['AUTHOR']}>
              <AuthorProfile />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <AuthorArticles />
            },
            {
              path: 'articles',
              element: <AuthorArticles />
            },
            {
              path: 'write-article',
              element: <WriteArticles />
            }
          ]
        },
        {
          path: 'admin-profile',
          element: (
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminProfile />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Navigate to="users" replace />
            },
            {
              path: 'users',
              element: <UserList />
            },
            {
              path: 'authors',
              element: <AuthorList />
            },
            { path: 'articles', element: <Articles /> }
          ]
        },
        {
          path: 'article/:id',
          element: <ArticleById />
        },
        {
          path: 'edit-article',
          element: <EditArticle />
        },
        {
          path: 'unauthorized',
          element: <Unauthorized />
        }
      ]
    }
  ])

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={routerObj} />
    </div>
  )
}

export default App