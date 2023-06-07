// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import logo from '../img/LOGO.png'; //импорт логотипа
import { Menu, ConfigProvider, Space  } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Icon, {
  SignalFilled,
  ToolFilled,
  CloseCircleFilled
} from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн
import maindb from '../json/main.json';
import Reports from './Reports.js'; //импорт файла "Report.js"
import Admins from './Admins';
import Loaders from './components/Loaders';
//-------------------------------------------------------------------------------------------------------------
import { getDatabase, ref, onValue, set} from "firebase/database";
import { db } from '../classicfbdb';

import { ReactComponent as Icon_Box } from '../img/svg/box.svg'; //импорт svg картинки
import { ReactComponent as Icon_List } from '../img/svg/list.svg'; //импорт svg картинки
import { ReactComponent as Icon_Folder } from '../img/svg/folder.svg'; //импорт svg картинки
import { ReactComponent as Icon_Clipboard } from '../img/svg/clipboard.svg'; //импорт svg картинки
import { ReactComponent as Icon_Moving } from '../img/svg/moving.svg'; //импорт svg картинки


export default class Main extends React.Component {

  // Конструктор реакт состояний ---------------------------------------------------------------------------
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      data: {},
      pages: 'main',
      userInfo: {}
    }
  }
  //-------------------------------------------------------------------------------------------------------------

  // Логика отрисовки страниц. В зависимости от того что выбрано отрисовывается соответствующий файл ---------------------------------------------------------------------------
  pagesRender() {
    switch (this.state.pages) {
      case "reports":
        return (
          <Reports refresh = {() => this.componentDidMount()} dataUpdate = {(data) => this.saveDate(data)} data={this.state.data} userInfo={this.state.userInfo}/>
        )
      case "admin":
        return (
          <Admins dataUpdate = {(data) => this.saveDate(data)} data={this.state.data} userInfo={this.state.userInfo} mesTest = {(type, mes) => { this.props.mesTest(type, mes) }}/>
        )
      default:
        return (
          <div className='App'>
            <Space direction="vertical">
              <img src={logo} />
              <span>
                { this.getComplex(this.state.userInfo["Комплекс"]) } комплекс
              </span>
            </Space>
          </div>
        )
    }
  }
  //-------------------------------------------------------------------------------------------------------------

  getComplex(id) {
    return this.state.data.manComlpex[id]["Комплекс"]
  }

  // Функция вызывается перед отрисовкой страницы (перед выполнением функции "render") ---------------------------------------------------------------------------
  // Эта функция получает из localStorage браузера сохраненный токен, и сохраняет базовую информацию о пользователе в состояния
  componentDidMount() {
    let login = localStorage.getItem('tn');

    const starCountRef = ref(db, 'db');
    let result;
    onValue(starCountRef, (snapshot) => {
      result = snapshot.val()
      result.users.map((item, index) => {
        if (item.Login == login) {
          this.setState({
            userInfo: item,
            isLoaded:true,
            data: result
          })
        }
      })
    })

  }
  //-------------------------------------------------------------------------------------------------------------

  saveDate(data) {
    const db = getDatabase();
    set(ref(db, 'db'), data);
  } 

  render() {
    // Конфиг элементов навигации ---------------------------------------------------------------------------
    let items = [
        {
          label: 'Отчеты',
          key: 'reports',
          icon: <SignalFilled />,
        },
        {
          label: 'Панель администратора',
          key: 'admin',
          disabled: !this.state.userInfo.Admins,
          icon: <ToolFilled />,
        },
        {
          label: 'Выход',
          key: 'exit',
          icon: <CloseCircleFilled />,
          danger: true
        },
      ]
    //-------------------------------------------------------------------------------------------------------------

    // Функция обрабатывает нажатие на элементы из навигации ---------------------------------------------------------------------------
    const onClickTest = (e) => {
      if (e.key === 'exit') {
        this.props.navigate('/');
      } else {
        this.setState({
          pages: e.key //отобразить нужную страницу
        })
      }
    };
    //-------------------------------------------------------------------------------------------------------------

    // Возрват рендера. Рисует главную страницу ---------------------------------------------------------------------------
    // Навигация (элемент "Menu") рисуется один раз, а функция "pagesRender()" возрващает определенную страницу в зависимости от того в какой странице находится пользователь. (Функцию "pagesRender()" я описал выше) 
    return (
      <div>
        {
          this.state.isLoaded ? 
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#00b96b',
                  colorPrimaryBorder: 'red'
                },
              }}
            >
              <Menu onClick={onClickTest} mode="horizontal" items={items} style={{ backgroundColor: "#EFF0F5" }} />
              {this.pagesRender()} 
            </ConfigProvider>
            :
            <Loaders/>
        }
      </div>
    );
    //-------------------------------------------------------------------------------------------------------------
  }
}
