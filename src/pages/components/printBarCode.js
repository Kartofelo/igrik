import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, InputNumber, Select } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Barcode from 'react-barcode';

export default class PrintBarCode extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#00b96b',
                            colorPrimaryBorder: 'red'
                        },
                    }}
                >
                    <Space className='scanDiv' direction="vertical" size={20}>
                        <Space style={{ border: '1px solid black', padding: '10px' }} direction="vertical" size={10}>
                            <Space
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                                direction="horizontal"
                            >
                                <h3 style={{ marginTop: '0px' }}>{this.props.boxInfo.type == 0 ? 'Отправка в магазин' : 'Брак'}</h3>
                            </Space>
                            <Space
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                                direction="horizontal"
                            >
                                Коробка №
                                <h4 style={{ margin: '0px' }}>{this.props.barCode}</h4>
                            </Space>
                            <Space
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                                direction="horizontal"
                            >
                                Дата упаковки
                                <h4 style={{ margin: '0px' }}>{this.props.boxInfo.date}</h4>
                            </Space>
                            <Space
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                                direction="horizontal"
                            >
                                Отправитель
                                <h4 style={{ margin: '0px' }}>{this.props.boxInfo.sender} комплекс</h4>
                            </Space>
                            {
                                this.props.boxInfo.type == 0 ?
                                    <Space
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                        direction="horizontal"
                                    >
                                        Получатель
                                        <h4 style={{ margin: '0px' }}>{this.props.boxInfo.receiver} комплекс</h4>
                                    </Space>
                                :
                                ''
                            }
                            <Barcode value={this.props.barCode} />
                        </Space>
                        <Space
                            className='deletePrint'
                            direction="horizontal"
                        >
                            <Button onClick={() => { window.print() }} type="primary">Распечатать</Button>
                            <Button onClick={() => {this.props.close()}} ghost type="primary">Закрыть</Button>
                        </Space>
                    </Space>
                </ConfigProvider>
            </div>
        )
    }

}