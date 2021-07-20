import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { breadcrumbsUpdate } from '../../actions/breadcrumbs';
import { modalUpdate } from '../../actions/modal';
import { redirectSet } from '../../actions/redirect';
import { redTypes } from '../../types/reduxTypes';
import { BreadCrumbs } from '../BreadCrumbs';
import { staticURLDocs } from '../../url';
import { setLot } from '../../actions/lot';
import { floatingButtonSet } from '../../actions/floatingButton';

export const Lot = () => {

    const { lotId, projectId } = useParams();

    const { lots, projects } = useSelector(state => state);

    const currentLot = lots.find(lot => lot._id === lotId);

    const currentProject = projects.find(p => p._id === projectId);

    const { area, isCorner, lotNumber, measures, state, manzana, files } = currentLot;

    // const pricePerSqMeter = currentLot.pricePerSqMeter.toLocaleString();

    const price = currentLot.price.toLocaleString();

    const { name, availableServices } = currentProject;

    const stateName = state === 'available' ? 'Disponible' : state === 'delivered' ? 'Entregado' : 'Liquidado';


    const dispatch = useDispatch();

    useEffect(() => {

        const modalInfo = {
            title: 'Editar lote',
            text: `¿Desea editar el lote ${lotNumber}?`,
            link: `/proyectos/edit/${projectId}/lote/${lotId}`,
            okMsg: 'Sí',
            closeMsg: 'No',
        }

        dispatch(modalUpdate(modalInfo));

        const breadcrumbs = [
            {
                dispName: 'proyectos',
                link: '/proyectos'
            },
            {
                dispName: `${name}`,
                link: `/proyectos/ver/${projectId}`
            },
            {
                dispName: `Lote ${lotNumber}`,
                link: `/proyectos/ver/${projectId}/lote/${lotId}`
            }
        ]

        dispatch(breadcrumbsUpdate(redTypes.projects, breadcrumbs));
        dispatch(floatingButtonSet('pencil', redTypes.projectEdit));
        dispatch(redirectSet(redTypes.projects, `/proyectos/ver/${projectId}/lote/${lotId}`));
        dispatch(setLot(currentLot));

    }, [dispatch, projectId, lotId, lotNumber, name, currentLot]);

    const handleOpen = (path) => {
        const url = `${staticURLDocs}${path}`;

        window.open(url, "_blank", 'top=500,left=200,frame=true,nodeIntegration=no');
    }


    return (
        <>

            <BreadCrumbs type={redTypes.projects} />

            <div className="project">

                <div className="project__header">
                    <div className="left">
                        <h3> Lote {lotNumber} </h3>
                        <span> {name} </span>
                    </div>
                    <div className="right">
                        <div className={`item state ${state}`}>
                            <p> {stateName} </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <img src="../assets/img/lots.png" alt="" />
                        <h4>Información General del Lote</h4>
                    </div>
                    <div className="card__body">
                        <div className="right">
                            <div className="card__body__item">
                                <span>Número de Lote</span>
                                <p> {lotNumber} </p>
                            </div>
                            <div className="card__body__item">
                                <span>Número de Manzana</span>
                                <p> {manzana} </p>
                            </div>
                            <div className="card__body__item">
                                <span>Proyecto</span>
                                <p> {name} </p>
                            </div>
                            <div className="card__body__item">
                                <span>Esquina</span>
                                <p> {isCorner ? 'Sí' : 'No'} </p>
                            </div>
                            <div className="card__body__item">
                                <span>Área</span>
                                <p> {area}m<sup>2</sup> </p>
                            </div>
                            <div className="card__body__item">
                                <span >Precio</span>
                                <p className="price"> ${price} </p>
                            </div>

                        </div>
                        <div className="left">
                            <h4>Medidas</h4>
                            {
                                measures.length > 0 && (

                                    measures.map((measure) => (
                                        <div key={measure._id} className="card__body__item">
                                            <span>
                                                {measure.title}
                                            </span>
                                            <p>
                                                {measure.value}m<sup>2</sup>
                                            </p>
                                        </div>
                                    )
                                    )

                                )
                            }

                        </div>
                    </div>
                </div>


                <div className="card-grid mt-2">
                    <div className="card scroll">
                        <div className="card__header">
                            <img src="../assets/img/services.png" alt="" />
                            <h4>Servicios Disponibles</h4>
                        </div>
                        <div className="card__body__list">
                            {
                                availableServices.map(service => (
                                    service.length > 0 && (
                                        <div key={service} className="card__body__list__item">
                                            <p>{service}</p>
                                        </div>
                                    )
                                ))
                            }
                        </div>
                        <div className="card__header mt-4">
                            <img src="../assets/img/docs.png" alt="" />
                            <h4>Documentos Disponibles</h4>
                        </div>
                        <div className="card__body__list">
                            {
                                files?.map(({ name, staticPath }) => (
                                    <div onClick={() => { handleOpen(staticPath) }} key={name} className="card__body__list__doc">
                                        <p>
                                            {name}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>

                    </div>

                </div>


            </div>

            {/* <FloatingButton type='lotAvailable' />
            <FloatingButtonSecondary type='lotAvailable' /> */}
        </>
    )
}