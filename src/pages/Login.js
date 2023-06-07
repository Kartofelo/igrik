// импорт компонентов и файлов ---------------------------------------------------------------------------
import logo from '../img/LOGO.png'; //импорт логотипа
import React from 'react'; //импорт компонентов из библиотеки реакт
import { LockOutlined, UserOutlined } from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн
import { Button, ConfigProvider, Form, Input, Space } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import maindb from '../json/main.json'; 
import Loaders from './components/Loaders';
//-------------------------------------------------------------------------------------------------------------
import { getDatabase, ref, onValue} from "firebase/database";
import { db } from '../classicfbdb';

export default class Login extends React.Component {

    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //эту часть кода не показывай в отчетах и не забудь удалить этот комментарий когда будешь отправлять прогу на флешке
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            data: {}
        }
    }

    checking(values) {
        let param = false;
        this.state.data.map((item, index) => {
            if (item.Login == values.username) {
                param = (item.Pas == values.password);
            }
        })
        return param;
    }

    componentDidMount() {
        const starCountRef = ref(db, 'db/users');
        let result;
        onValue(starCountRef, (snapshot) => {
            result = snapshot.val()
            this.setState({
                isLoaded:true,
                data: result
            })
        })
    }
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //конец секретной части кода
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    render() {
        // Функция нажатия на кнопку "Войти" ---------------------------------------------------------------------------
        const onFinish = (values) => {
            // console.log(result);
            if (this.checking(values)) { //если логин и пароль правильный ...
                localStorage.setItem('tn', values.username); //... то сохраненяем токен в localStorage
                this.props.navigate('/main'); //переход на главную страницу
            }
            else { //иначе ...
                this.props.mesTest('error', "Не верный пароль или логин!"); //... выводим ошибку
            }
        };
        //-------------------------------------------------------------------------------------------------------------


       // Возрват рендера. Рисует страницу логин ---------------------------------------------------------------------------
        return (
            <div className="LoginMain">
                { this.state.isLoaded ? '' : <Loaders/>}
                <Space align="center" style={{"height":"calc(100vh - 30px)"}}>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: '#00b96b',
                            },
                        }}
                    >
                        <Form
                            name="normal_login"
                            className="login-form"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <img src={logo} />
                            </div>
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Пожалуйста, введите ваш логин!' }]}>
                                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Логин" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}>
                                <Input
                                    prefix={<LockOutlined className="site-form-item-icon" />}
                                    type="password"
                                    placeholder="Пароль" />
                            </Form.Item>

                            <Form.Item>

                                <Button type="primary" htmlType="submit" className="main_button">
                                    Войти
                                </Button>
                            </Form.Item>
                        </Form>
                    </ConfigProvider>
                </Space>
                    
            </div>
        );
        //-------------------------------------------------------------------------------------------------------------
    }
}
