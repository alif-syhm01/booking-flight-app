'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tag, Button } from 'antd';
import { SwapRightOutlined, LoadingOutlined } from '@ant-design/icons';
import supabase from '../supabase';

export default function SearchFlight() {
  const [isLoading, setIsLoading] = useState(false);
  // const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [flightSchedules, setFlightSchedules] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const searchParams = useSearchParams();
  const {
    departure,
    arrival,
    departure_date,
    return_date = null,
    adult,
    children,
    baby,
  } = Object.fromEntries(searchParams.entries());

  const departureDateStrFormat = new Date(departure_date).toLocaleDateString(
    'id-ID',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const returnDateStrFormat =
    return_date !== null &&
    new Date(return_date).toLocaleDateString('id-ID', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  async function getFlightSchedules(
    passengerSchedule,
    passengerTypeSchedule = null
  ) {
    try {
      const {
        departure_date,
        departure_airport_iata_code,
        arrival_airport_iata_code,
      } = passengerSchedule;

      setIsLoading(true);

      const { data, error: supabaseErr } = await supabase
        .from('flights')
        .select(
          'id, airlines(name, iata_code, country), departure_airport:airports!departure_airport_id(id,name, iata_code), arrival_airport:airports!arrival_airport_id(id, name, iata_code), flight_number, departure_datetime, arrival_datetime, price'
        )
        .eq('departure_airport.iata_code', departure_airport_iata_code)
        .eq('arrival_airport.iata_code', arrival_airport_iata_code)
        .gte(
          'departure_datetime',
          `${
            passengerTypeSchedule == null ? departure_date : return_date
          }T00:00:00Z`
        )
        .lte(
          'departure_datetime',
          `${
            passengerTypeSchedule == null ? departure_date : return_date
          }T23:59:59Z`
        )
        .not('departure_airport', 'is', null)
        .not('arrival_airport', 'is', null)
        .order('departure_datetime', { ascending: true })
        .order('arrival_datetime', { ascending: true })
        .order('price', { ascending: true });

      if (supabaseErr === null) {
        const flightsData = data.map((row, index) => {
          const id_flight = row.id;
          const flight_number = row.flight_number;
          const { name: airline_name } = row.airlines;
          const { iata_code: departure_airport_iata_code } =
            row.departure_airport;
          const departure_datetime = row.departure_datetime;
          const { iata_code: arrival_airport_iata_code } = row.arrival_airport;
          const arrival_datetime = row.arrival_datetime;
          const price = new Intl.NumberFormat('id-Id', {
            style: 'currency',
            currency: 'IDR',
          }).format(row.price);

          // date time settings
          const departure_time_string = `${new Date(departure_datetime)
            .getHours()
            .toString()
            .padStart(2, '0')}:${new Date(departure_datetime)
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
          const arrival_time_string = `${new Date(arrival_datetime)
            .getHours()
            .toString()
            .padStart(2, '0')}:${new Date(arrival_datetime)
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
          const time_journey =
            new Date(arrival_datetime) - new Date(departure_datetime);
          const time_journey_hours = Math.floor(
            time_journey / (60 * 60 * 1000)
          );
          const time_journey_minutes = Math.floor(
            (time_journey % (60 * 60 * 1000)) / (60 * 1000)
          );

          return {
            id_flight: id_flight,
            flight_number: flight_number,
            airline_name: airline_name,
            departure_time: departure_time_string,
            arrival_time: arrival_time_string,
            departure_airport_iata_code: departure_airport_iata_code,
            arrival_airport_iata_code: arrival_airport_iata_code,
            time_journey_hours: time_journey_hours,
            time_journey_minutes: time_journey_minutes,
            price: price,
          };
        });

        setFlightSchedules(flightsData);
      } else {
        throw supabaseErr;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function selectedFlightDetail() {
    const { flight_schedule_type } = this;

    if (flight_schedule_type === 'departure') {
      setSelectedDeparture(this);

      if (return_date) {
        const flightReturnScheduleParams = {
          departure_date: return_date,
          departure_airport_iata_code: arrival,
          arrival_airport_iata_code: departure,
        };

        getFlightSchedules(flightReturnScheduleParams, flight_schedule_type);
      }
    }

    if (flight_schedule_type === 'return') {
      setSelectedReturn(this);
    }
  }

  function onChangeDepartureSchedule() {
    setSelectedDeparture(null);
    setSelectedReturn(null);

    const flightScheduleParams = {
      departure_date: departure_date,
      departure_airport_iata_code: departure,
      arrival_airport_iata_code: arrival,
    };

    getFlightSchedules(flightScheduleParams);
  }

  useEffect(() => {
    const flightScheduleParams = {
      departure_date: departure_date,
      departure_airport_iata_code: departure,
      arrival_airport_iata_code: arrival,
    };

    getFlightSchedules(flightScheduleParams);
  }, []);

  return (
    <>
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
      <main>
        <section className='w-full pt-8 pb-4'>
          <div className='max-w-7xl h-full mx-auto my-0'>
            <div className='flex flex-col items-start gap-4 bg-slate-100 p-4 rounded-md'>
              <span className='font-bold'>Keterangan Jadwal</span>
              <div className='w-full grid grid-cols-auto-fill-schedule gap-4'>
                <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                  <span className='text-base font-bold'>Bandara Asal</span>
                  <p className='text-sm'>{departure}</p>
                </span>
                <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                  <span className='text-base font-bold'>Jadwal Pergi</span>
                  <p className='text-sm'>{arrival}</p>
                </span>
                <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                  <span className='text-base font-bold'>Jadwal Pergi</span>
                  <p className='text-sm'>{departureDateStrFormat}</p>
                </span>
                {returnDateStrFormat && (
                  <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                    <span className='text-base font-bold'>Jadwal Pulang</span>
                    <p className='text-sm'>{returnDateStrFormat}</p>
                  </span>
                )}
                <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                  <span className='text-base font-bold'>Dewasa</span>
                  <p className='text-sm'>{adult}</p>
                </span>
                <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                  <span className='text-base font-bold'>Anak</span>
                  <p className='text-sm'>{children}</p>
                </span>
                <span className='flex flex-col bg-white px-4 py-1 rounded-md'>
                  <span className='text-base font-bold'>Bayi</span>
                  <p className='text-sm'>{baby}</p>
                </span>
              </div>
              <Link
                href='/'
                className='w-full bg-emerald-500 text-white text-center py-2 rounded-md transition-all hover:bg-emerald-400'
              >
                Ubah Jadwal
              </Link>
            </div>
          </div>
        </section>
        {selectedDeparture && (
          <section className='w-full pt-4 pb-4'>
            <div className='max-w-7xl h-full mx-auto my-0'>
              <div className='flex flex-col items-start justify-between gap-5 bg-slate-100 p-4 rounded-md'>
                <div className='w-full flex items-start justify-between'>
                  <div className='flex flex-col items-start gap-2 bg-white p-2 rounded-md'>
                    <Tag color='green' className='text-xs m-0 px-4 py-1'>
                      PERGI
                    </Tag>
                    <div className='flex gap-44'>
                      <div className='flex flex-col gap-[0.15rem]'>
                        <div className='text-sm font-bold'>
                          {selectedDeparture.airline_name}{' '}
                          <span className='text-xs text-gray-400'>
                            ({selectedDeparture.flight_number})
                          </span>
                        </div>
                        <p className='text-sm'>
                          {selectedDeparture.departure_schedule} (
                          {selectedDeparture.departure_time} -{' '}
                          {selectedDeparture.arrival_time})
                        </p>
                      </div>
                      <div className='flex flex-col gap-[0.15rem]'>
                        {return_date && (
                          <span
                            className='self-end text-sm text-emerald-400 font-bold cursor-pointer'
                            onClick={onChangeDepartureSchedule}
                          >
                            Ubah
                          </span>
                        )}
                        <p
                          className={`text-sm font-bold ${
                            return_date ? '' : 'mt-auto'
                          }`}
                        >
                          {selectedDeparture.price}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedReturn && (
                    <div className='flex flex-col items-start gap-2 bg-white p-2 rounded-md'>
                      <Tag color='red' className='text-xs m-0 px-4 py-1'>
                        PULANG
                      </Tag>
                      <div className='flex gap-44'>
                        <div className='flex flex-col gap-[0.15rem]'>
                          <div className='text-sm font-bold'>
                            {selectedReturn.airline_name}{' '}
                            <span className='text-xs text-gray-400'>
                              ({selectedReturn.flight_number})
                            </span>
                          </div>
                          <p className='text-sm'>
                            {selectedReturn.departure_schedule} (
                            {selectedReturn.departure_time} -{' '}
                            {selectedReturn.arrival_time})
                          </p>
                        </div>
                        <div className='flex flex-col gap-[0.15rem]'>
                          <p className='text-sm font-bold mt-auto'>
                            {selectedReturn.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  className='w-full disabled:border-none enabled:bg-emerald-500 enabled:border-none enabled:text-white enabled:text-center rounded-md transition-all hover:enabled:bg-emerald-400 hover:enabled:border-none hover:enabled:!text-white'
                  size='large'
                  disabled={
                    return_date
                      ? selectedDeparture && selectedReturn
                        ? false
                        : true
                      : selectedDeparture && false
                  }
                >
                  Pesan
                </Button>
              </div>
            </div>
          </section>
        )}
        <section className='w-full pt-4 pb-8'>
          <div className='max-w-7xl h-full mx-auto my-0'>
            <ul className='flex flex-col gap-4 bg-slate-100 p-4 rounded-md'>
              {isLoading
                ? ''
                : return_date && selectedDeparture
                ? 'Jadwal Pulang'
                : 'Jadwal Pergi'}
              {isLoading ? (
                <li className='self-center'>
                  <LoadingOutlined className='text-4xl' />
                </li>
              ) : (
                flightSchedules &&
                flightSchedules.map((flightSchedule) => (
                  <li
                    key={flightSchedule.id_flight}
                    className='w-full flex flex-col gap-4 bg-white px-4 py-2 rounded-md cursor-pointer'
                    onClick={selectedFlightDetail.bind({
                      airline_name: flightSchedule.airline_name,
                      flight_number: flightSchedule.flight_number,
                      departure_schedule: departureDateStrFormat,
                      departure_time: flightSchedule.departure_time,
                      arrival_time: flightSchedule.arrival_time,
                      price: flightSchedule.price,
                      flight_schedule_type:
                        return_date && selectedDeparture
                          ? 'return'
                          : 'departure',
                    })}
                  >
                    <div className='text-base text-emerald-500 font-bold'>
                      {flightSchedule.airline_name}{' '}
                      <span className='text-xs text-gray-400'>
                        ({flightSchedule.flight_number})
                      </span>
                    </div>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-8'>
                        <div className='flex flex-col'>
                          <span className='text-2xl font-bold'>
                            {flightSchedule.departure_time}
                          </span>
                          <p className='text-sm text-center text-gray-400'>
                            {flightSchedule.departure_airport_iata_code}
                          </p>
                        </div>
                        <div className='flex flex-col items-center'>
                          <span className='text-sm text-gray-400'>
                            {flightSchedule.time_journey_hours}j{' '}
                            {flightSchedule.time_journey_minutes}m
                          </span>
                          <SwapRightOutlined className='text-gray-400' />
                          <span className='text-sm text-gray-400'>
                            Langsung
                          </span>
                        </div>
                        <div>
                          <span className='text-2xl font-bold'>
                            {flightSchedule.arrival_time}
                          </span>
                          <p className='text-sm text-center text-gray-400'>
                            {flightSchedule.arrival_airport_iata_code}
                          </p>
                        </div>
                      </div>
                      <span className='text-2xl text-emerald-500'>
                        {flightSchedule.price}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
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
