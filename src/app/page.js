'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  VerticalAlignMiddleOutlined,
  DingtalkCircleFilled,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Input,
  List,
  Checkbox,
  Modal,
  notification,
  DatePicker,
} from 'antd';
import supabase from './supabase';

export default function Home() {
  // state for place flight schedule
  const [departureCityAirport, setDepartureCityAirport] = useState('Jakarta');
  const [departureAirport, setDepartureAirport] = useState('CGK');
  const [arriveCityAirport, setArriveCityAirport] = useState('Surabaya');
  const [arriveAirport, setArriveAirport] = useState('SUB');
  const [isModalDepartureAirport, setIsModalDepartureAirport] = useState(false);
  const [isModalArriveAirport, setIsModalArriveAirport] = useState(false);
  const [departureAirportText, setDepartureAirportText] = useState('');
  const [arriveAirportText, setArriveAirportText] = useState('');

  const [listAirports, setListAirports] = useState();
  const [api, contextHolder] = notification.useNotification();

  // swap function for departure aiport with arrive airpot
  function onSwappingAirportDestination() {
    // swap the city airport
    setDepartureCityAirport(arriveCityAirport);
    setArriveCityAirport(departureCityAirport);

    // swap the airport
    setDepartureAirport(arriveAirport);
    setArriveAirport(departureAirport);
  }

  // modal for selecting departure airport
  function showModalDepartureAirport() {
    setIsModalDepartureAirport(!isModalDepartureAirport);
  }

  function handleCancelModalDepartureAirport() {
    setIsModalDepartureAirport(!isModalDepartureAirport);
    setDepartureAirportText('');
  }

  function departureAirportHandleChange(e) {
    const departureAirportName = e.target.value;

    setDepartureAirportText(departureAirportName);

    getAirports(departureAirportName);
  }

  // modal for selecting arrive airport
  function showModalArriveAirport() {
    setIsModalArriveAirport(!isModalArriveAirport);
  }

  function handleCancelModalArriveAirport() {
    setIsModalArriveAirport(!isModalArriveAirport);
    setArriveAirportText('');
  }

  function arriveAirportHandleChange(e) {
    const arriveAirportName = e.target.value;

    setArriveAirportText(arriveAirportName);

    getAirports(arriveAirportName);
  }

  // error selected airport notification
  function selectedAirportErrorNotification() {
    api.error({
      message: (
        <h6 className='font-bold text-base'>
          Duplikasi Asal dan Tujuan Destinasi
        </h6>
      ),
      description:
        'Harap jangan memilih asal bandara dan tujuan bandara yang sama, silahkan coba lagi!',
    });
  }

  function selectedDepartureAirport() {
    const { cityName, iataCode } = this;
    const departure = `${cityName} ${iataCode}`;
    const arrive = `${arriveCityAirport} ${arriveAirport}`;

    // departure is not same with arrive
    if (departure !== arrive) {
      // update the departure city airport value and departure airport value
      setDepartureCityAirport(cityName);
      setDepartureAirport(iataCode);

      // close the modal and set the input to empty string
      setIsModalDepartureAirport(false);
      setDepartureAirportText('');
    }

    // departure is same with arrive
    if (departure === arrive) {
      selectedAirportErrorNotification();
    }
  }

  function selectedArriveAirport() {
    const { cityName, iataCode } = this;
    const arrive = `${cityName} ${iataCode}`;
    const departure = `${departureCityAirport} ${departureAirport}`;

    // departure is not same with arrive
    if (departure !== arrive) {
      // update the departure city airport value and departure airport value
      setArriveCityAirport(cityName);
      setArriveAirport(iataCode);
      // close the modal and set the input to empty string
      setIsModalArriveAirport(false);
      setArriveAirportText('');
    }
    // departure is same with arrive
    if (departure === arrive) {
      selectedAirportErrorNotification();
    }
  }

  // SUPABASE INIT
  async function getAirports(airport_name = '') {
    const { data, error } = await supabase
      .from('airports')
      .select('id, name, iata_code, location')
      .ilike('name', `%${airport_name}%`);

    if (error === null) setListAirports(data);
  }

  useEffect(() => {
    getAirports();
  }, []);

  // state for date flight schedule
  const [openDepartureDatePicker, setOpenDepartureDatePicker] = useState(false);
  const [openArriveDatePicker, setOpenArriveDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nextDate, setNextDate] = useState(
    new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
  );
  const [checked, setChecked] = useState(false);

  // function on change checkbox
  function onChange(e) {
    setChecked(e.target.checked);
  }

  // change date
  function onChangeDepartureDate(date) {
    const currentDateValue = new Date(date);

    setCurrentDate(currentDateValue);

    // only when the current date is more then next date
    if (currentDateValue.getTime() > nextDate.getTime()) {
      setNextDate(new Date(currentDateValue.getTime() + 24 * 60 * 60 * 1000));
    }
  }

  function onChangeArriveDate(date) {
    setNextDate(new Date(date));
  }

  // date format
  const formatStrDate = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };

  // string date format
  const dateNowStrFormat = currentDate.toLocaleDateString(
    'id-ID',
    formatStrDate
  );
  const nextDateStrFormat = nextDate.toLocaleString('id-ID', formatStrDate);

  // state for passenger
  const [isModalPassengerOpen, setIsModalPassengerOpen] = useState(false);
  const [countAdult, setCountAdult] = useState(1);
  const [countChild, setCountChild] = useState(0);
  const [countBaby, setCountBaby] = useState(0);
  const [totalPassenger, setTotalPassenger] = useState(1);

  // modal for passenger detail
  function showModal() {
    setIsModalPassengerOpen(true);
  }

  function handleSubmit() {
    // doing for get the passenger detail
    const totalPassengers = countAdult + countChild + countBaby;

    setTotalPassenger(totalPassengers);

    // close the modal
    setIsModalPassengerOpen(false);
  }

  function handleCancel() {
    setIsModalPassengerOpen(false);
  }

  function addCounter() {
    // set a count in each condition
    const { type } = this;

    // for adult condition
    if (type === 'adult') {
      setCountAdult(countAdult + 1);
    }

    // for child condition
    if (type === 'child') {
      setCountChild(countChild + 1);
    }

    // for baby condition
    if (type === 'baby') {
      setCountBaby(countBaby + 1);
    }
  }

  function removeCounter() {
    // set a count in each condition
    const { type } = this;

    // for adult condition
    if (type === 'adult') {
      setCountAdult(countAdult - 1);
    }

    // for child condition
    if (type === 'child') {
      setCountChild(countChild - 1);
    }

    // for baby condition
    if (type === 'baby') {
      setCountBaby(countBaby - 1);
    }
  }

  return (
    <>
      {contextHolder}
      <header className='p-5 bg-emerald-500'>
        <div className='max-w-7xl flex items-center justify-between mx-auto my-0'>
          <Link href='/' className='text-lg font-bold text-white'>
            Booking App
          </Link>
          <div className='flex items-center gap-4'>
            <Link
              href='/'
              className='border-2 border-white px-6 py-2 text-white rounded-md transition-all hover:bg-white hover:text-emerald-500 '
            >
              Masuk
            </Link>
            <Link
              href='/'
              className='border-2 border-white bg-white px-6 py-2 rounded-md text-emerald-500 transition-all hover:bg-transparent hover:text-white'
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>
      <main className='flex-grow flex'>
        <section className='w-full'>
          <div className='max-w-7xl h-full mx-auto my-0 flex items-center justify-between'>
            <h1 className='max-w-lg text-6xl text-emerald-500 leading-tight font-bold tracking-wide'>
              Cek Harga Tiket Pesawat Online Pada Hari Ini
            </h1>
            <div className='bg-slate-50 w-[24.25rem] p-8 rounded-lg flex flex-col gap-4'>
              <div className='bg-slate-100 p-4 rounded-lg flex flex-col gap-4'>
                <div
                  className='flex flex-col gap-0 cursor-pointer'
                  onClick={showModalDepartureAirport}
                >
                  <p className='text-sm text-slate-400'>Asal</p>
                  <span className='text-lg font-bold text-black'>
                    {`${departureCityAirport} `}
                    <span className='text-gray-500'>{departureAirport}</span>
                  </span>
                </div>
                <Modal
                  title={
                    <p className='text-black text-2xl font-bold'>
                      Pilih Asal Bandara
                    </p>
                  }
                  open={isModalDepartureAirport}
                  onCancel={handleCancelModalDepartureAirport}
                  footer={null}
                  className='relative'
                >
                  <Input
                    size='large'
                    placeholder='Pilih Asal Bandara'
                    className='mt-3'
                    onChange={departureAirportHandleChange}
                    value={departureAirportText}
                    allowClear
                  />
                  {departureAirportText !== '' && listAirports ? (
                    listAirports.length === 0 ? (
                      <div className='flex flex-col items-center mt-7 gap-4'>
                        <div className='flex flex-col items-center gap-3'>
                          <CloseCircleOutlined className='text-8xl text-red-600' />
                          <h3 className='text-2xl font-bold'>
                            Asal Bandara tidak ada!
                          </h3>
                        </div>
                        <p className='text-center text-lg'>
                          Coba ubah kata kunci pencarian dan pastikan kata kunci
                          yang anda masukkan sudah benar!
                        </p>
                      </div>
                    ) : (
                      <div
                        className='max-h-[32.5rem] relative -left-6 mt-6 overflow-y-scroll'
                        style={{
                          width: 'calc(100% - -48px)',
                        }}
                      >
                        <ul>
                          {listAirports.map((airport) => (
                            <li
                              key={airport.id}
                              className='cursor-pointer px-7 hover:bg-slate-100'
                              onClick={selectedDepartureAirport.bind({
                                cityName: airport.location.split(' - ')[0],
                                iataCode: airport.iata_code,
                              })}
                            >
                              <div className='flex items-start py-2 '>
                                <DingtalkCircleFilled
                                  className='mt-1'
                                  style={{
                                    fontSize: '1.5rem',
                                    color: '#9ca3af',
                                  }}
                                />
                                <div className='ml-4'>
                                  <h6 className='text-lg font-bold'>
                                    {`${airport.location.split(' - ')[0]}, ${
                                      airport.location.split(' - ')[1]
                                    }`}
                                  </h6>
                                  <p className='text-base text-slate-600'>
                                    {airport.name
                                      .split('Bandar Udara ')
                                      .join('')}
                                  </p>
                                </div>
                                <span className='ml-auto self-center w-20 py-0.5 text-center bg-gray-200 text-slate-800 rounded-md'>
                                  {airport.iata_code}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ) : (
                    ''
                  )}
                </Modal>
                <div className='relative'>
                  <div className='border-t-2 border-slate-200'></div>
                  <Button
                    icon={<VerticalAlignMiddleOutlined />}
                    className='absolute -top-4 right-0 bg-white border-none'
                    onClick={onSwappingAirportDestination}
                  ></Button>
                </div>
                <div
                  className='flex flex-col gap-0 cursor-pointer'
                  onClick={showModalArriveAirport}
                >
                  <p className='text-sm text-slate-400'>Tujuan</p>
                  <span className='text-lg font-bold text-black'>
                    {`${arriveCityAirport} `}
                    <span className='text-gray-500'>{arriveAirport}</span>
                  </span>
                </div>
                <Modal
                  title={
                    <p className='text-black text-2xl font-bold'>
                      Pilih Tujuan Bandara
                    </p>
                  }
                  open={isModalArriveAirport}
                  onCancel={handleCancelModalArriveAirport}
                  footer={null}
                  className='relative'
                >
                  <Input
                    size='large'
                    placeholder='Pilih Tujuan Bandara'
                    className='mt-3'
                    onChange={arriveAirportHandleChange}
                    value={arriveAirportText}
                    allowClear
                  />
                  {arriveAirportText !== '' && listAirports ? (
                    listAirports.length === 0 ? (
                      <div className='flex flex-col items-center mt-7 gap-4'>
                        <div className='flex flex-col items-center gap-3'>
                          <CloseCircleOutlined className='text-8xl text-red-600' />
                          <h3 className='text-2xl font-bold'>
                            Tujuan Bandara tidak ada!
                          </h3>
                        </div>
                        <p className='text-center text-lg'>
                          Coba ubah kata kunci pencarian dan pastikan kata kunci
                          yang anda masukkan sudah benar!
                        </p>
                      </div>
                    ) : (
                      <div
                        className='max-h-[32.5rem] relative -left-6 mt-6 overflow-y-scroll'
                        style={{
                          width: 'calc(100% - -48px)',
                        }}
                      >
                        <ul>
                          {listAirports.map((airport) => (
                            <li
                              key={airport.id}
                              className='cursor-pointer px-7 hover:bg-slate-100'
                              onClick={selectedArriveAirport.bind({
                                cityName: airport.location.split(' - ')[0],
                                iataCode: airport.iata_code,
                              })}
                            >
                              <div className='flex items-start py-2 '>
                                <DingtalkCircleFilled
                                  className='mt-1'
                                  style={{
                                    fontSize: '1.5rem',
                                    color: '#9ca3af',
                                  }}
                                />
                                <div className='ml-4'>
                                  <h6 className='text-lg font-bold'>
                                    {`${airport.location.split(' - ')[0]}, ${
                                      airport.location.split(' - ')[1]
                                    }`}
                                  </h6>
                                  <p className='text-base text-slate-600'>
                                    {airport.name
                                      .split('Bandar Udara ')
                                      .join('')}
                                  </p>
                                </div>
                                <span className='ml-auto self-center w-20 py-0.5 text-center bg-gray-200 text-slate-800 rounded-md'>
                                  {airport.iata_code}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ) : (
                    ''
                  )}
                </Modal>
              </div>
              <div className='bg-slate-100 p-4 rounded-lg flex flex-col gap-4'>
                <div className='relative'>
                  <DatePicker
                    open={openDepartureDatePicker}
                    style={{
                      position: 'absolute',
                      visibility: 'hidden',
                      width: '0',
                      height: '0',
                      top: 40,
                      border: '1px solid green',
                    }}
                    onOpenChange={(openDepartureDatePicker) =>
                      setOpenDepartureDatePicker(openDepartureDatePicker)
                    }
                    disabledDate={(value) =>
                      value && value < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    onChange={onChangeDepartureDate}
                  />
                  <div
                    className='flex flex-col gap-0 cursor-pointer'
                    onClick={() =>
                      setOpenDepartureDatePicker(!openDepartureDatePicker)
                    }
                  >
                    <p className='text-sm text-slate-400'>Pergi</p>
                    <span className='text-lg font-bold text-black'>
                      {dateNowStrFormat}
                    </span>
                  </div>
                </div>
                {checked && (
                  <>
                    <div className='border-t-2 border-slate-200'></div>
                    <div className='relative'>
                      <DatePicker
                        open={openArriveDatePicker}
                        placement='bottomLeft'
                        style={{
                          position: 'absolute',
                          visibility: 'hidden',
                          width: '0',
                          height: '0',
                          top: 40,
                          border: '1px solid green',
                        }}
                        onOpenChange={(openArriveDatePicker) =>
                          setOpenArriveDatePicker(openArriveDatePicker)
                        }
                        disabledDate={(value) =>
                          value &&
                          value <
                            new Date(new Date(currentDate).setHours(0, 0, 0, 0))
                        }
                        onChange={onChangeArriveDate}
                      />
                      <div
                        className='flex flex-col gap-0 cursor-pointer'
                        onClick={() =>
                          setOpenArriveDatePicker(!openArriveDatePicker)
                        }
                      >
                        <p className='text-sm text-slate-400'>Pulang</p>
                        <span className='text-lg font-bold text-black'>
                          {nextDateStrFormat}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <Checkbox checked={checked} onChange={onChange}>
                  Pulang - Pergi?
                </Checkbox>
              </div>
              <div
                className='bg-slate-100 p-4 rounded-lg font-bold text-black cursor-pointer'
                onClick={showModal}
              >
                {totalPassenger} Penumpang
              </div>
              <Modal
                title={
                  <p className='text-black text-2xl font-bold'>
                    Atur Penumpang
                  </p>
                }
                open={isModalPassengerOpen}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okButtonProps={{ className: 'bg-blue-500' }}
                cancelButtonProps={{ style: { display: 'none' } }}
                okText='Selesai'
              >
                <div className='flex items-center justify-between mt-5'>
                  <p className='text-base'>Dewasa (12 tahun ke atas)</p>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='medium'
                      shape='circle'
                      disabled={countAdult <= 1}
                      onClick={removeCounter.bind({ type: 'adult' })}
                    >
                      -
                    </Button>
                    <span>{countAdult}</span>
                    <Button
                      size='medium'
                      shape='circle'
                      disabled={countAdult >= 8}
                      onClick={addCounter.bind({
                        type: 'adult',
                      })}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className='border-t-2 border-slate-200 mt-3'></div>
                <div className='flex items-center justify-between my-3'>
                  <p className='text-base'>
                    Anak - Anak (2 - 11 tahun ke atas)
                  </p>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='medium'
                      shape='circle'
                      disabled={countChild <= 0}
                      onClick={removeCounter.bind({ type: 'child' })}
                    >
                      -
                    </Button>
                    <span>{countChild}</span>
                    <Button
                      size='medium'
                      shape='circle'
                      disabled={countChild >= 6}
                      onClick={addCounter.bind({
                        type: 'child',
                      })}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className='border-t-2 border-slate-200 mb-3'></div>
                <div className='flex items-center justify-between mb-7'>
                  <p className='text-base'>Bayi (di bawah 2 tahun)</p>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='medium'
                      shape='circle'
                      disabled={countBaby <= 0}
                      onClick={removeCounter.bind({ type: 'baby' })}
                    >
                      -
                    </Button>
                    <span>{countBaby}</span>
                    <Button
                      size='medium'
                      shape='circle'
                      disabled={countBaby >= 4}
                      onClick={addCounter.bind({
                        type: 'baby',
                      })}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </Modal>
              <Link
                href={{
                  pathname: '/search-flight',
                  query: {
                    departure: departureAirport,
                    arrival: arriveAirport,
                    departure_date: currentDate.toISOString().slice(0, 10),
                    ...(checked && {
                      arrive_date: nextDate.toISOString().slice(0, 10),
                    }),
                    adult: countAdult,
                    children: countChild,
                    baby: countBaby,
                  },
                }}
                className='bg-emerald-500 font-bold text-white text-center py-2 rounded-md transition-all hover:bg-emerald-400'
              >
                Cari Tiket
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className='mt-auto p-4 bg-emerald-500'>
        <div className='max-w-7xl flex items-center justify-between mx-auto my-0'>
          <Link href='/' className='text-lg font-bold text-white'>
            Booking App
          </Link>
          <h1 className='text-white'>
            &copy; Jellyfish Team {currentDate.getFullYear()}
          </h1>
        </div>
      </footer>
    </>
  );
}
