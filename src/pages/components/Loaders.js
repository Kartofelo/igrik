// В этом файле и описывать нечего
// Это всего компонент загрузки (анимация крутилки)
// Нужен чтобы перекрыть интерфейс пользователю пока данные грузяться (чтобы он не натворил глупостей во время загрузки)
import React from 'react'; 
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, ConfigProvider, Space   } from 'antd';

const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
      }}
      spin
    />
  );

export default class Loaders extends React.Component {

    render() {
        return(
            <div className='loaderDiv'>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#00b96b',
                            colorPrimaryBorder: 'red'
                        },
                    }}
                >
                    <Space direction="horizontal" size={20}>
                        {this.props.text}
                        <Spin indicator={antIcon} />
                    </Space>
                </ConfigProvider>
            </div>
        )
    }
}