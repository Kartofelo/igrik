import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, DatePicker, Select } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Loaders from './components/Loaders';
import locale from 'antd/es/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default class ExportSheet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            table: {},
            filters: {
                dispatch: '',
                reason: [],
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

    expandedRowTable(record, i) {
        let childerColumn = [];
        // console.log(record);
        for (let key in record.thisChildren[0]) {
            if (key != 'key' && key != 'thisChildren') {
                if (key === "Фото") {
                    childerColumn.push({
                        title: key,
                        dataIndex: key,
                        key: key,
                        render: (key) => <img src={`../items/${key}.png`} />
                    })
                } else {
                    childerColumn.push({
                        title: key,
                        dataIndex: key,
                        key: key,
                    })
                }
            }
        }

        return (
            <Table columns={childerColumn} pagination={false} dataSource={record.thisChildren} />
        )
    }

    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [];
        for (let key in this.state.table[0]) {
            if (key != 'key' && key != 'thisChildren') {
                if (key === "Фото") {
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
            <Table
                className='tableStyle'
                columns={column}
                dataSource={this.filterTable()}
                expandedRowRender={(record, i) => this.expandedRowTable(record, i)}
            />
        )
    }

    filterTable() {
        let result = this.state.table.filter((item, index) => {
            let dispatch = item['Номер отправки'].toLowerCase().indexOf(this.state.filters.dispatch.toLowerCase()) == -1 ? false : true;
            let dateVal = new Date(item['Дата']);
            let date = this.state.filters.date.start === null ? true : (dateVal >= this.state.filters.date.start && dateVal <= this.state.filters.date.end);
            let reason = this.state.filters.reason.length === 0 ? true : ( this.state.filters.reason.indexOf(item['Причина']) != -1 )

            return dispatch && date && reason
        });

        return result;
    }

    changeDatePicker(val) {
        let result = this.state.filters;

        if (val != null) {
            result.date.start = val[0]['$d'];
            result.date.end = val[1]['$d'];
        } else {
            result.date.start = null;
            result.date.end = null;
        }

        this.setState({ filters: result });
    }

    getChildren(item, index) {
        let children = [];
        let originalAssembling = this.props.data.assemblingBoxes.filter((itemArh) => {
            return itemArh['Id коробки'] == item.id
        })

        originalAssembling.map((itemAs, indexAs) => {
            let thisProducts = this.props.data.products[itemAs['Id продукта']];
            children.push({
                'Фото': thisProducts.Img,
                'Артикул': thisProducts['Артикул'],
                'Кол-во': itemAs['Количество'],
                'Название': thisProducts['Название'],
                key: `${index}${indexAs}`
            })
        })

        return children
    }

    componentDidMount() {
        let boxes = [];
        let originalBoxes = this.props.data.boxes.filter((item) => {
            return item['Комплекс'] == this.props.userInfo['Комплекс']
        });

        originalBoxes.map((item, index) => {
            boxes.push({
                'Номер отправки': item['Номер отправки'],
                'Причина': item['Причина'],
                'Дата': item['Дата'],
                thisChildren: this.getChildren(item, index),
                'key': index
            })
        })

        this.setState({
            table: boxes,
            isLoaded: true
        })
    }

    handleChange(value) {
        let filters = this.state.filters;
        filters.reason = value
        this.setState({
            filters: filters
        })
    };

    getReasons() {
        let result = [];
        let checking = [];

        this.state.table.map((item,index)=>{
            if(checking.indexOf(item['Причина']) === -1) {
                result.push({
                    label: item['Причина'],
                    value: item['Причина']
                })

                checking.push(item['Причина']);
            }
        })
        return result
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
                                <Button type="primary" onClick={() => this.props.back()} ghost style={{ marginTop: '15px' }}>Назад</Button>
                                <h2>Перемещение</h2>
                                <Space direction='horizontal' size={10}>
                                    <Space direction='vertical'>
                                        Номер отправки
                                        <Input onChange={this.onChangeFilters.bind(this, 1)} name="dispatch" placeholder="Номер отправки" />
                                    </Space>
                                    <Space direction='vertical'>
                                        Причина
                                        {/* <Input onChange={this.onChangeFilters.bind(this, 1)} name="reason" placeholder="Причина" /> */}
                                        <Select
                                            mode="multiple"
                                            allowClear
                                            style={{
                                                width: '302px'
                                            }}
                                            placeholder="Выберите причину"
                                            onChange={(val) => this.handleChange(val)}
                                            options={this.getReasons(this.filterTable())}
                                        />
                                    </Space>
                                    <Space direction='vertical'>
                                        Дата
                                        <DatePicker.RangePicker onChange={(val) => { this.changeDatePicker(val) }} locale={locale} />
                                    </Space>
                                </Space>
                                {this.renderTable()}
                            </Space>
                        </ConfigProvider>
                        :
                        <Loaders />
                }
            </div>
        );
    }

}