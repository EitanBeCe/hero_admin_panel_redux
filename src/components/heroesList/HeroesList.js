import {useHttp} from '../../hooks/http.hook';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { createSelector } from 'reselect'

import { fetchHeroes } from '../../actions';
import { heroDeleted } from './heroesSlice';

import HeroesListItem from "../heroesListItem/HeroesListItem";
import Spinner from '../spinner/Spinner';

// Задача для этого компонента:
// При клике на "крестик" идет удаление персонажа из общего состояния из heroes[]
// Усложненная задача:
// Удаление идет и с json файла при помощи метода DELETE (сделать запрос на тот же адрес локалхост)
// это есть тут https://www.npmjs.com/package/json-server

const HeroesList = () => {

    const filteredHeroesSelector = createSelector(
        (state) => state.filters.activeFilter,
        (state) => state.heroes.heroes,
        (filter, heroes)=>{
            if (filter === 'all') {
                return heroes;
            } else {
                return heroes.filter(item => item.element === filter);
            }
        }
    );

    // const filteredHeroes = useSelector(state => {
    //     if (state.filters.activeFilter === 'all') {
    //         return state.heroes.heroes;
    //     } else {
    //         return state.heroes.heroes.filter(item => item.element === state.filters.activeFilter);
    //     }
    // });

    const filteredHeroes = useSelector(filteredHeroesSelector);

    const heroesLoadingStatus = useSelector(state => state.heroes.heroesLoadingStatus);
    const dispatch = useDispatch();
    const {request} = useHttp();

    useEffect(() => {
        dispatch(fetchHeroes(request));
        // eslint-disable-next-line
    }, []);

    // Функция берет id и по нему удаляет ненужного персонажа из store и из фейк сервер файла JSON
    // ТОЛЬКО если запрос на удаление прошел успешно
    // Отслеживайте цепочку действий actions => reducers
    const onDelete = useCallback((id) => {
        // Удаление персонажа по его id
        request(`http://localhost:3001/heroes/${id}`, "DELETE")
            .then(data => console.log(data, 'Deleted'))
            .then(dispatch(heroDeleted(id)))
            .catch(err => console.log(err));
        // eslint-disable-next-line  
    }, [request]);
    // const onDelete = (id) => {
    //     // Удаление персонажа по его id просто из верстки
    //     dispatch(heroDeleted(id));
    // };

    if (heroesLoadingStatus === "loading") {
        return <Spinner/>;
    } else if (heroesLoadingStatus === "error") {
        return <h5 className="text-center mt-5">Ошибка загрузки</h5>
    }

    const renderHeroesList = (arr) => {
        if (arr.length === 0) {
            return <h5 className="text-center mt-5">Героев пока нет</h5>
        }

        return arr.map(({id, ...props}) => {
            return <HeroesListItem key={id} {...props}
                            onDelete={() => onDelete(id)}/>
        })
    }

    const elements = renderHeroesList(filteredHeroes);
    return (
        <ul>
            {elements}
        </ul>
    )
}

export default HeroesList;