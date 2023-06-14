// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, InputNumber } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Loaders from './components/Loaders';
import locale from 'antd/es/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import Icon, {
    CameraFilled,
} from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн

import ScanProducts from './components/ScanProducts';

export default class AMovement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            table: [],
            productArt: '',
            scanStart: false,
            barCode: null,
            todayStr: null
        }
    }

    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [
            {
                title: 'Фото',
                dataIndex: 'Фото',
                key: 0,
                render: (key) => <img src={`../items/${key}.png`} />
            },
            {
                title: 'Артикул',
                dataIndex: 'Артикул',
                key: 1,
            },
            {
                title: 'Название',
                dataIndex: 'Название',
                key: 2,
            },
            {
                title: 'Остаток',
                dataIndex: 'Остаток',
                key: 3,
            },
            {
                title: 'Количество',
                dataIndex: 'Количество',
                key: 4,
                render: (key, record, index) => <InputNumber onChange={(val) => this.changeCount(index, val)} name={key} max={this.state.table[index]['Остаток']} value={this.state.table[index]['Количество']} min={0} />
            }
        ];
        
        const source = this.state.table

        // 2 - тут отрисовывается таблица которую возвращает функция "filterTable()" (ее описал выше)
        return (
            <Table
                // className='tableStyle'
                style={{
                    width:'60vw'
                }}
                columns={column}
                dataSource={[...source]}
                rowKey={this.state.table.key}
            />
        )
    }

    changeCount(ind, val) {
        let data = this.state.table;

        data[ind]['Количество'] = val;

        this.setState({
            table: data
        })
    }
    getIdProducts(art) {
        let result = null;

        this.props.data.products.map((item, index) => {
            if(item['Артикул'] == art)
                result = index
        })

        return result
    }

    getIdRemains(id) {
        let result = null;
        let data = this.props.data.remains.filter((item, index) => {
            return item['Комплекс'] == this.props.userInfo['Комплекс']
        });

        data.map((item,index) => {
            if(item['Id продукта'] == id)
                result = item['id']
        })

        return result;
    }
    addProduct(art, count) {
        let table = this.state.table;
        let check = true;
        let row = 0;
        let id = this.getIdProducts(art);
        let rId = this.getIdRemains(id);
        
        table.map((item, index) => {
            if(item['Артикул'] == art) {
                check = false;
                row = index;
            }
        })

        if (check) {
            if(id === null) {
                this.props.mesTest('error', "Похоже, артикул введен не верно")
            } else {
                if(rId === null) {
                    this.props.mesTest('error', "Остатков этого продукта для отправки не осталось!")
                } else {
                    table.push({
                        'Фото': this.props.data.products[id]['Img'],
                        'Артикул': art,
                        'Название': this.props.data.products[id]['Название'],
                        'Остаток': this.props.data.remains[rId]['Остатки на складе'],
                        'Количество': count,
                        key: table.length,
                        rId: rId,
                        id: id
                    });
                    this.setState({
                        table: table,
                        productArt: ''
                    });
                }
            }
        } else {
            if(table[row]['Количество'] < table[row]['Остаток']) {
                table[row]['Количество'] += count;
                this.setState({
                    table: table,
                    productArt: ''
                });
            } else {
                this.props.mesTest('error', "Остатков этого продукта для отправки не осталось");
            }
        }
    }

    addMultyProducts(val) {
        val.map((item) => {
            this.addProduct(item.art, item.count);
        })

        this.setState({
            scanStart: false
        })
    }

    onChangeFilters = (tg, e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }

    render() {
        return (
            <div>
                { 
                    this.state.scanStart ? 
                    <ScanProducts 
                        cancel={() => this.setState({ scanStart: false })}
                        data={this.props.data}
                        userInfo={this.props.userInfo}
                        mesTest={(type, mes) => { this.props.mesTest(type, mes) }}
                        save={(val) => this.addMultyProducts(val)}
                    /> 
                    : 
                    '' 
                }
                <ConfigProvider
                    locale={locale}
                    theme={{
                        token: {
                            colorPrimary: '#00b96b',
                            colorPrimaryBorder: 'red',
                            colorFillSecondary: 'red'
                        },
                    }}
                >
                    <Space direction="vertical">
                        <Button type="primary" onClick={() => {this.props.back()}} ghost style={{ marginTop: '15px' }}>Назад</Button>
                        <h2>
                            Перемещение {
                                this.props.type == 0 ? `в зал`
                                : 'в склад'
                            }
                        </h2>
                        <Space direction='horizontal' size={10}>
                                <Button onClick={() => {this.setState({scanStart: true})}} icon={<CameraFilled />} ghost type="primary"/>
                                <Input value={this.state.productArt} onChange={this.onChangeFilters.bind(this, 1)} name="productArt" placeholder="Артикул" />
                                <Button onClick={() => this.addProduct(this.state.productArt, 1)} disabled={this.state.productArt == ''} type="primary">Добавить материал</Button>
                        </Space>
                        {this.renderTable()}
                        <Button disabled={this.state.table.length == 0} type="primary">Переместить {this.props.type == 0 ? `в зал`: 'в склад'} </Button>
                    </Space>
                </ConfigProvider>
            </div>
        );
    }

}