// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, DatePicker } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Loaders from './components/Loaders';
import locale from 'antd/es/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default class Movement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            table: {},
            filters: {
                art: '',
                name: '',
                date: {
                    start: null,
                    end: null
                }
            }
        }
    }

    onChangeFilters = (tg, e) => {
        let name = e.target.name;
        let value = e.target.value;
        let result = this.state.filters;
        result[name] = value;
        this.setState({ filters: result });
    }

    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [];
        for(let key in this.state.table[0]) {
            if(key != 'key') { 
                if(key === "Фото") {
                    column.push({
                        title: key,
                        dataIndex: key,
                        key: key,
                        render: (key) => <img src={`../items/${key}.png`} />
                    })
                } else {
                    column.push({
                        title: key,
                        dataIndex: key,
                        key: key,
                    })
                }
            }
        }

        // 2 - тут отрисовывается таблица которую возвращает функция "filterTable()" (ее описал выше)
        return (
            <Table className='tableStyle' columns={column} dataSource={this.filterTable()}/>
        )
    }

    filterTable() {
        let result = this.state.table.filter((item) => {
            let art = item['Артикул'].toLowerCase().indexOf(this.state.filters.art.toLowerCase()) == -1 ? false : true;
            let name = item['Название'].toLowerCase().indexOf(this.state.filters.name.toLowerCase()) == -1 ? false : true;
            let dateVal = new Date(item['Дата']);
            let date = this.state.filters.date.start === null ? true : ( dateVal >= this.state.filters.date.start && dateVal <= this.state.filters.date.end );
            return art && name && date
        });
        return result;
    }

    getProductProperty(item, property) {
        let id = this.props.data.remains[item['Id остатков']]['Id продукта'];
        return this.props.data.products[id][property]
    }

    componentDidMount() {
        let movementHistory = [];
        let originalMovement = this.props.data.movement.filter((item) => {
            return item['Комплекс'] == this.props.userInfo['Комплекс']
        });

        originalMovement.map((item, index) => {
            movementHistory.push({
                "Фото": this.getProductProperty(item,'Img'),
                'Артикул': this.getProductProperty(item,'Артикул'),
                'Кол-во': item['Количество'],
                'Название': this.getProductProperty(item,'Название'),
                'Зона': item['Зона'],
                'Дата': item['Дата'],
                'key': index
            })
        })

        this.setState({
            table: movementHistory,
            isLoaded: true
        })
    }

    changeDatePicker(val) {
        let result = this.state.filters;
        
        if(val != null) {
            result.date.start = val[0]['$d'];
            result.date.end = val[1]['$d'];
        } else {
            result.date.start = null;
            result.date.end = null;
        }

        this.setState({ filters: result });
    }

    render() {
        return (
            <div>
                {
                    this.state.isLoaded ? 
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
                                <Button type="primary" onClick={() => this.props.back()} ghost style={{marginTop: '15px'}}>Назад</Button>
                                <h2>Перемещение</h2>
                                <Space direction='horizontal' size={10}>
                                <Space direction='vertical'>
                                        Артикул
                                        <Input onChange={this.onChangeFilters.bind(this, 1)} name="art" placeholder="Артикул" />
                                    </Space>
                                    <Space direction='vertical'>
                                        Название
                                        <Input onChange={this.onChangeFilters.bind(this, 1)} name="name" placeholder="Название" />
                                    </Space>
                                    <Space direction='vertical'>
                                        Дата
                                        <DatePicker.RangePicker onChange={(val) => {this.changeDatePicker(val)}} locale={locale}/>    
                                    </Space>
                                </Space>
                                {this.renderTable()}
                            </Space>
                        </ConfigProvider>
                        :
                        <Loaders/>
                }
            </div>
        );
    }

}