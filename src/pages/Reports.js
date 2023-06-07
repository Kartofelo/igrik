// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Breadcrumb } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Icon, {
    PlusSquareFilled,
} from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн

import Remains from './Remains.js'; //импорт файла "Remains.js"
import ArhInvent from './ArhInvent.js';
import Movement from './Movement.js';
import ExportSheet from './ExportSheet.js';

import { ReactComponent as Icon_Box } from '../img/svg/box.svg'; //импорт svg картинки
import { ReactComponent as Icon_List } from '../img/svg/list.svg'; //импорт svg картинки
import { ReactComponent as Icon_Folder } from '../img/svg/folder.svg'; //импорт svg картинки
import { ReactComponent as Icon_Clipboard } from '../img/svg/clipboard.svg'; //импорт svg картинки
import { ReactComponent as Icon_Moving } from '../img/svg/moving.svg'; //импорт svg картинки
//-------------------------------------------------------------------------------------------------------------

export default class Reports extends React.Component {

    // Конструктор реакт состояний ---------------------------------------------------------------------------
    constructor(props) {
        super(props);
        this.state = {
            pages: 'main'
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    // Логика отрисовки страниц. В зависимости от того что выбрано отрисовывается соответствующий файл (пока есть только меню отчетов и остатки) ---------------------------------------------------------------------------
    renderPages() {
        switch (this.state.pages) {
            case "arhivInvent":
                return(
                    <ArhInvent refresh = {() => this.props.refresh()} dataUpdate = {(data) => this.props.dataUpdate(data)} back={() => this.setState({pages: 'main'})} data={this.props.data} userInfo={this.props.userInfo} />
                )

            case "movement":
                return(
                    <Movement back={() => this.setState({pages: 'main'})} data={this.props.data} userInfo={this.props.userInfo} />
                )

            case "exportSheet":
                return(
                    <ExportSheet back={() => this.setState({pages: 'main'})} data={this.props.data} userInfo={this.props.userInfo} />
                )

            case "remains":
                return(
                    <Remains back={() => this.setState({pages: 'main'})} data={this.props.data} userInfo={this.props.userInfo} />
                )

            default:
                return (
                    <div>
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#00b96b',
                                    colorPrimaryBorder: 'red'
                                },
                            }}
                        >
                            <Space direction="vertical">
                                <h2>Тов. остатки</h2>
                                <Space>
                                    <Button onClick={() => this.setState({pages:"remains"})} icon={<Icon component={Icon_Box} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Тов. остатки по артикулам
                                    </Button>
                                </Space>
                                <h2>Инвентаризация</h2>
                                <Space>
                                    <Button onClick={() => this.setState({pages:"arhivInvent"})} icon={<Icon component={Icon_Folder} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Архив инвентаризаций
                                    </Button>
                                </Space>
                                <h2>Передвижение товара</h2>
                                <Space>
                                    <Button onClick={() => this.setState({pages:"movement"})} icon={<Icon component={Icon_Moving} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Перемещение
                                    </Button>
                                    <Button onClick={() => this.setState({pages:"exportSheet"})} icon={<Icon component={Icon_Clipboard} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Лист на вывоз
                                    </Button>
                                </Space>
                            </Space>
                        </ConfigProvider>
                    </div>
                )
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    // Функция рендера. Рисует страницу ---------------------------------------------------------------------------
    // функция "renderPages()" возвращает определнную страницу внутри страницы "отчеты" в зависимости от того что выбрал пользователь (Функцию "pagesRender()" я описал выше) 
    render() {
        return (
            <div>
                {this.renderPages()}
            </div>
        );
    }
    //-------------------------------------------------------------------------------------------------------------
}
