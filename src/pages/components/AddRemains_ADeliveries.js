// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, InputNumber } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Icon, {
    CameraFilled,
} from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн
import Loaders from './Loaders'; //импорт самописного компонента - анимации загрузки
import locale from 'antd/es/date-picker/locale/ru_RU'; //импорт языка из ант дизайна
import ScanProducts from './ScanProducts'; //импорт самописного компонента - компонент для подсчета количества через сканирование камерой


export default class AddRemains extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            table: [],
            counts: [],
            modal: false,
            scanStart: false
        }
    }

    // функция обработки изменений в инпутах ---------------------------------------------------------------------------
    changeCount(ind, val) {
        let data = this.state.table;

        data[ind]['Фактическое кол-во'] = val;

        this.setState({
            table: data
        })
    }
    //-------------------------------------------------------------------------------------------------------------

    // функция отрисовки таблицы ---------------------------------------------------------------------------
    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [];
        for (let key in this.state.table[0]) {
            if (key != 'key') {
                switch (key) {
                    case "Фото":
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                            render: (key) => <img src={`../items/${key}.png`} />
                        })
                        break;

                    case "Фактическое кол-во":
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                            render: (key, record, index) => <InputNumber onChange={(val) => this.changeCount(index, val)} name={key} value={this.state.table[index]['Фактическое кол-во']} min={0} />
                        })
                        break;

                    default:
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                        })
                        break;
                }
            }
        }

        // 2 - тут отрисовывается таблица которую возвращает функция "filterTable()" 
        return (
            <Table
                className='tableStyle'
                columns={column}
                dataSource={this.filterTable()}
            />
        )
    }
    //-------------------------------------------------------------------------------------------------------------


    filterTable() {
        let result = this.state.table
        return result;
    }

    // функция преднсатройки перед рендером ---------------------------------------------------------------------------
    //  (функция componentDidMount() всегда вызывается перед тем как отрисовать страницу)
    // тут идет потготовка данных, из полученных данных формируем нужную в текущей таблице структуру
    componentDidMount() {
        let products = [];
        let manProducts = this.props.data.products;
        let counts = this.state.counts;
        let original = this.props.data.assemblingBoxes.filter((item) => {
            return this.props.boxes.indexOf(item['Id коробки']) != -1
        });

        original.map((item, index) => {
            let id = item['Id продукта'];
            products.push({
                'Фото': manProducts[id].Img,
                'Артикул': manProducts[id]['Артикул'],
                'Записанное кол-во': item['Количество'],
                'Фактическое кол-во': 0,
                'key': index
            });
            counts.push(0)
        })

        this.setState({
            table: products,
            isLoaded: true
        })
    }
    //-------------------------------------------------------------------------------------------------------------

    // Функция возвращает количество по артиклу из массива ---------------------------------------------------------------------------
    checkArt(art, arr) {
        let result = -1;
        arr.map((item, index) => {
            if (item.art == art)
                result = item.count
        })
        return result
    }
    //-------------------------------------------------------------------------------------------------------------

    // Функция сохраняет количество из сканера в инпуты таблицы ---------------------------------------------------------------------------
    save(val) {
        let table = this.state.table;

        table.map((item, index) => {
            if (this.checkArt(item['Артикул'], val) != -1)
                table[index]['Фактическое кол-во'] = this.checkArt(item['Артикул'], val);
        })

        this.setState({
            scanStart: false,
            table: table
        })
    }
    //-------------------------------------------------------------------------------------------------------------

    // функция вызывается перед сохранением. Проверяет равно ли фактическое кол-во с заявленным ---------------------------------------------------------------------------
    // если не равняется открывает модальное окно с предупреждением
    preSaveCounts() {
        let normal = true;
        this.state.table.map((item,index) => {
            if(item['Фактическое кол-во'] != item['Записанное кол-во']) normal = false;
        })

        if(normal) {
            this.saveCounts();
        } else {
            this.setState({
                modal: true
            })
        }
    }
    //-------------------------------------------------------------------------------------------------------------

    // функция возвращает id продукта по артиклу ---------------------------------------------------------------------------
    getId(art) {
        let result = -1
        this.props.data.products.map((item,index) => {
            if(item['Артикул'] == art) {
                result = index;
            }
        })
        return result
    }
    //-------------------------------------------------------------------------------------------------------------

    // функция возвращает id остатка по id продукта ---------------------------------------------------------------------------
    // причем может вернуть из любой группе данных, главное чтобы по структуре в данных был и ид остатков и ид продукта
    getRemainsId(id, data) {
        let result = -1;
        data.map((item,index) => {
            if(item['Id продукта'] == id) result = item['id'];
        })
        return result
    }
    //-------------------------------------------------------------------------------------------------------------

    // сохраняет всю поставку в нужные остатки этого магазина ---------------------------------------------------------------------------
    saveCounts() {
        let newData = this.props.data;
        let arr = [];
        let remainsFilter = newData.remains.filter((item) => {
            return item['Комплекс'] == this.props.userInfo['Комплекс']
        })

        this.state.table.map((item) => {
            arr.push({
                id: this.getId(item['Артикул']),
                count: item['Фактическое кол-во']
            });
        })

        arr.map((item,index) => {
            if(this.getRemainsId(item.id, remainsFilter) != -1) {
                newData.remains[this.getRemainsId(item.id, remainsFilter)]['Остатки на складе'] += item.count
            } else {
                newData.remains.push({
                    "Id продукта": item.id,
                    "id": newData.remains.length,
                    "Комплекс": this.props.userInfo['Комплекс'],
                    "Остатки в зале": 0,
                    "Остатки на складе": item.count
                })
            }
        })
        this.props.dataUpdate(newData);
        this.props.finish();
    }
    //-------------------------------------------------------------------------------------------------------------

    // Возвращает модальное окно ---------------------------------------------------------------------------
    modalWindow() {
        if(this.state.modal) {
            return(
                <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                    <Space style={{width: '500px'}} className='scanDiv' direction="vertical" size={30}>
                        <h3 style={{margin: '0px'}}>Вы уверены?</h3>
                        Фактическое количество отличается от заявленного. Процесс будет не обратим
                        <Space  direction="horizontal" size={10}>
                            <Button onClick={() => this.saveCounts()} type="primary">Сохранить</Button>
                            <Button onClick={() => this.setState({modal: false})} ghost type="primary">Отмена</Button>
                        </Space>
                    </Space>
                </div>
            )
        } else return null
    }
    //-------------------------------------------------------------------------------------------------------------

    // функция которая рисует страницу ---------------------------------------------------------------------------
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
                            {this.modalWindow()}
                            {
                                this.state.scanStart ?
                                    <ScanProducts
                                        cancel={() => this.setState({ scanStart: false })}
                                        data={this.props.data}
                                        userInfo={this.props.userInfo}
                                        mesTest={(type, mes) => { this.props.mesTest(type, mes) }}
                                        save={(val) => this.save(val)}
                                    />
                                    :
                                    ''
                            }
                            <Space direction="vertical">
                                <Button type="primary" onClick={() => this.props.cancel()} ghost style={{ marginTop: '15px' }}>Отмена</Button>
                                <h2>Проверка количества</h2>
                                <Button type="primary" onClick={() => this.setState({ scanStart: true })} icon={<CameraFilled />}>Сканировать</Button>
                                {this.renderTable()}
                                <Button type="primary" onClick={() => this.preSaveCounts()}>Сохранить</Button>
                            </Space>
                        </ConfigProvider>
                        :
                        <Loaders />
                }
            </div>
        );
    }
    //-------------------------------------------------------------------------------------------------------------
}