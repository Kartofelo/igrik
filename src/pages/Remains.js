// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, InputNumber } from 'antd'; //импорт компонентов из библиотеки АнтДизайн

import maindb from '../json/main.json';
import Loaders from './components/Loaders';
//-------------------------------------------------------------------------------------------------------------

export default class Remains extends React.Component {

    // Конструктор реакт состояний ---------------------------------------------------------------------------
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            table: {},
            filters: {
                art: '',
                name: '',
                remainsHall: null,
                remainsWH: null,
                size: null,
                price: {
                    min: null,
                    max: null
                }

            }
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    // Функция обработки фильтров (возвращает отфильтрованную таблицу, если в состояниях фильтры пустые, возвращает исходную таблицу) ---------------------------------------------------------------------------
    filterTable() {
        let result = this.state.table.filter((item) => {
            let art = item['Артикул'].toLowerCase().indexOf(this.state.filters.art.toLowerCase()) == -1 ? false : true;
            let name = item['Название'].toLowerCase().indexOf(this.state.filters.name.toLowerCase()) == -1 ? false : true;
            let remainsHall = item['Остаток в зале'] >= this.state.filters.remainsHall;
            let remainsWH = item['Остаток на складе'] >= this.state.filters.remainsWH;
            let size = parseFloat(item['Размер']) >= this.state.filters.size;
            let price = item['Цена'] >= this.state.filters.price.min && (this.state.filters.price.max === null ? true : item['Цена'] <= this.state.filters.price.max);
            return art && name && remainsHall && price && remainsWH && size
        })
        return result;
    }
    //-------------------------------------------------------------------------------------------------------------

    // Функция отрисовки таблицы ---------------------------------------------------------------------------
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
    //-------------------------------------------------------------------------------------------------------------

    // Функция обрабатывает ввод в инпуты фильтров (просто записывает что ввели в состояние фильтров), кроме числовых инпутов ---------------------------------------------------------------------------
    onChangeFilters = (tg, e) => {
        let name = e.target.name;
        let value = e.target.value;
        let result = this.state.filters;
        result[name] = value;
        this.setState({ filters: result });
    }
    //-------------------------------------------------------------------------------------------------------------

    // Функция обрабатывает ввод в числовых инпутов фильтров ---------------------------------------------------------------------------
    onChangeNumberFilters = (type, value) => {
        let result = this.state.filters;

        if(type === 'min' || type === 'max')
            result.price[type] = value; //... записываем в состояние фильтров мин и макс цену
        else {
            result[type] = value;
        }

        this.setState({ filters: result });
    }
    //-------------------------------------------------------------------------------------------------------------

    componentDidMount() {
        let remains = [];
        let originalRemains = this.props.data.remains.filter((item) => {
            return item['Комплекс'] == this.props.userInfo['Комплекс']
        })
        
        originalRemains.map((item,index) => {
            remains.push({
                "Фото": this.props.data.products[item['Id продукта']]['Img'],
                "Артикул": this.props.data.products[item['Id продукта']]['Артикул'],
                "Размер": this.props.data.products[item['Id продукта']]['Размер'],
                "Название": this.props.data.products[item['Id продукта']]['Название'],
                "Остаток на складе": item['Остатки на складе'],
                "Остаток в зале": item['Остатки в зале'],
                "Цена": this.props.data.products[item['Id продукта']]['Цена'],
                "key": index
            })
        })

        this.setState({
            table: remains,
            isLoaded: true
        })
    }

    // Отрисовываем страницу ---------------------------------------------------------------------------
    render() {
        return (
            <div>
                {
                    this.state.isLoaded ? 
                        <ConfigProvider
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
                                <h2>Тов. остатки по артикулам</h2>
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
                                        Размер
                                        <InputNumber onChange={(value) => this.onChangeNumberFilters('size',value)} min={0} placeholder="Размер" />
                                    </Space>
                                    <Space direction='vertical'>
                                        Цена
                                        <Space direction='horizontal' size={5}>
                                            <InputNumber onChange={(value) => this.onChangeNumberFilters('min',value)} min={0} placeholder="От"/>
                                            <InputNumber onChange={(value) => this.onChangeNumberFilters('max',value)} min={0} placeholder="До"/>
                                        </Space>
                                    </Space>
                                    <Space direction='vertical'>
                                        Остаток в зале
                                        <InputNumber onChange={(value) => this.onChangeNumberFilters('remainsHall',value)} style={{width: '150px'}} min={0} placeholder="Остаток в зале" />
                                    </Space>
                                    <Space direction='vertical'>
                                        Остаток на складе
                                        <InputNumber onChange={(value) => this.onChangeNumberFilters('remainsWH',value)} style={{width: '150px'}} min={0} placeholder="Остаток на складе" />
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
    //-------------------------------------------------------------------------------------------------------------
}
