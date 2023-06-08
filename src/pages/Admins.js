import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Radio } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Icon, {
    PlusSquareFilled,
} from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн

import ADeliveries from './ADeliveries';
import AExportSheet from './AExportSheet';

import { ReactComponent as Icon_Box } from '../img/svg/box.svg'; //импорт svg картинки
import { ReactComponent as Icon_List } from '../img/svg/list.svg'; //импорт svg картинки
import { ReactComponent as Icon_Folder } from '../img/svg/folder.svg'; //импорт svg картинки
import { ReactComponent as Icon_Clipboard } from '../img/svg/clipboard.svg'; //импорт svg картинки
import { ReactComponent as Icon_Moving } from '../img/svg/moving.svg'; //импорт svg картинки
import CompoundedSpace from 'antd/es/space';

export default class Admins extends React.Component {

    // Конструктор реакт состояний ---------------------------------------------------------------------------
    constructor(props) {
        super(props);
        this.state = {
            pages: 'main',
            modal: 0,
            complex: null,
            type: null
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    modalWindow() {
        const onChangeRadio = (e) => {
            this.setState({
                [e.target.name]: e.target.value
            })
        };

        const nex2t = (isFirst) => {
            if(isFirst && this.state.type == 0) {
                this.setState({
                    modal: 2
                })
            } else {
                this.setState({
                    modal: 0,
                    pages: "aExportSheet",
                    complex: this.state.complex === null ? 0 : this.state.complex
                })
            }
        }

        switch (this.state.modal) {
            case 1:
                return (
                    <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                        <Space style={{ width: '500px' }} className='scanDiv' direction="vertical" size={30}>
                            <h3 style={{ margin: '0px' }}>Выберите вид</h3>
                            <Radio.Group name={'type'} onChange={onChangeRadio} value={this.state.type}>
                                <Radio key={0} value={0}>Отправка в магазин</Radio>
                                <Radio key={1} value={1}>Брак</Radio>
                            </Radio.Group>
                            <Space direction="horizontal" size={10}>
                                <Button disabled={this.state.type == null} onClick={() => { nex2t(true) }} type="primary">Далее</Button>
                                <Button onClick={() => this.setState({ modal: 0 })} ghost type="primary">Отмена</Button>
                            </Space>
                        </Space>
                    </div>
                )
            case 2:
                return (
                    <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                        <Space style={{ width: '500px' }} className='scanDiv' direction="vertical" size={30}>
                            <h3 style={{ margin: '0px' }}>Выберите магазин</h3>
                            <Radio.Group name={'complex'} onChange={onChangeRadio} value={this.state.complex}>
                                {
                                    this.props.data.manComlpex.map((item, index) => {
                                        return <Radio disabled={index == this.props.userInfo['Комплекс']} key={index} value={index}>{item['Комплекс']} комплекс</Radio>
                                    })
                                }
                            </Radio.Group>
                            <Space direction="horizontal" size={10}>
                                <Button disabled={this.state.complex == null} onClick={() => { nex2t(false) }} type="primary">Далее</Button>
                                <Button onClick={() => this.setState({ modal: 0 })} ghost type="primary">Отмена</Button>
                            </Space>
                        </Space>
                    </div>
                )
            default:
                return ''
        }
    }

    renderPages() {
        switch (this.state.pages) {
            case "aExportSheet":
                return (
                    <AExportSheet
                        dataUpdate={(data) => this.props.dataUpdate(data)}
                        back={() => this.setState({ pages: 'main' })}
                        data={this.props.data}
                        complex = {this.state.complex}
                        type = {this.state.type}
                        userInfo={this.props.userInfo}
                        mesTest={(type, mes) => { this.props.mesTest(type, mes) }}
                    />
                )

            case "aDeliveries":
                return (
                    <ADeliveries
                        dataUpdate={(data) => this.props.dataUpdate(data)}
                        back={() => this.setState({ pages: 'main' })}
                        data={this.props.data}
                        userInfo={this.props.userInfo}
                        mesTest={(type, mes) => { this.props.mesTest(type, mes) }}
                    />
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
                                    <Button onClick={() => this.setState({ pages: "aDeliveries" })} icon={<Icon component={Icon_Box} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Принять поставки
                                    </Button>
                                </Space>
                                <h2>Передвижение товара</h2>
                                <Space>
                                    <Button onClick={() => this.setState({ pages: "" })} icon={<Icon component={Icon_Moving} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Перемещение
                                    </Button>
                                    <Button onClick={() => this.setState({ modal: 1 })} icon={<Icon component={Icon_Clipboard} />} size='large' type="primary" htmlType="submit" className="main_button">
                                        Лист на вывоз
                                    </Button>
                                </Space>
                            </Space>
                        </ConfigProvider>
                    </div>
                )
        }
    }

    // Функция рендера. Рисует страницу ---------------------------------------------------------------------------
    // функция "renderPages()" возвращает определнную страницу внутри страницы "отчеты" в зависимости от того что выбрал пользователь (Функцию "pagesRender()" я описал выше) 
    render() {
        return (
            <div>
                {this.modalWindow()}
                {this.renderPages()}
            </div>
        );
    }
    //-------------------------------------------------------------------------------------------------------------

}