// импорт компонентов и файлов ---------------------------------------------------------------------------
import './App.css'; //импорт стилистики (распростроняется на все внутренние файлы)
import Main from './pages/Main'; //Импорт файла "Main.js"
import Login from './pages/Login.js'; //Импорт файла "Login.js"
import { Routes, Route, Navigate, useNavigate, BrowserRouter } from 'react-router-dom'; //импорт компонентов навигации реакт
import { notification } from 'antd'; //импорт копонентов из АнтДизайн
 
function App(props) {
  const navigate = useNavigate(); //описание функции навигации
  //настройка попап сообщений ---------------------------------------------------------------------------
  const addMessage = (type, mes) => {
    notification[type]({
      placement:'bottomRight',
      message:mes,
      duration:2
    });
  }
  //-------------------------------------------------------------------------------------------------------------
  
  // Отрисовка логики навигации ---------------------------------------------------------------------------
  // Т.к приложение будет SPA, у нас всего 2 страницы в навигации. Это индексовая страница ("/") и главная страница ("/main").
  // Когда пользователь заходит в приложение (в индексовую страницу) по умолчанию отрисовывается файл "Login.js", внутри которого (перед отрисовкой страницы) проверяется локальные файлы браузера.
  // В случае если в локальных файлах браузера есть токен, то пользователя автоматически перекинет на главную страницу где уже отрисуется файл "Main.js"
  // Дальнейшая навигация происходит с помощью инструментов реакт и внутри файла "Main.js"
  return (
      <Routes>
        <Route 
          path='/' 
          element={
            <Login 
              navigate={navigate} 
              mesTest = {(type, mes) => {
                addMessage(type, mes);
              }}
            />
          }
        />
        <Route 
          path='/main' 
          element={
            <Main
              navigate={navigate} 
              mesTest = {(type, mes) => {
                addMessage(type, mes);
              }}
            />
          }
        />
      </Routes>
  );
  //-------------------------------------------------------------------------------------------------------------
}

function WithNavigate(props) {
  let navigate = useNavigate();
  return <App {...props} navigate={navigate}/>
}

// Функция для отрисовки страницы ---------------------------------------------------------------------------
function WithBrowserRouter(){
  return (
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  );
}
//-------------------------------------------------------------------------------------------------------------

export default WithBrowserRouter;
