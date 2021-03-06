import React from 'react'

const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}

export const Cancellations = ({ cancellations }) => {

    console.log(cancellations);

    return (
        <div className="card">



            {
                cancellations.map(({ _id, cancelledAt, commissionAmount, hadCommission, priceOnCancellation, refundedAmount, cancelledBy: { curp, email, fullName, rfc, phoneNumber } }, index) => {

                    const date = new Date(cancelledAt).toLocaleDateString('es-MX', dateOptions);

                    return (
                        <div key={_id} >

                            <div className={`card__header ${index > 1 ? 'mt-4' : 'mt-1'}  `}>
                                <h4>Cancelación {index + 1}</h4>
                            </div>

                            <div className="card__body">

                                <div className="right">

                                    <div className="card__body__item">
                                        <span>Cliente</span>
                                        <p>{fullName}</p>
                                    </div>

                                    <div className="card__body__item">
                                        <span>Número de contacto</span>
                                        <p>{phoneNumber}</p>
                                    </div>

                                    <div className="card__body__item">
                                        <span>Correo electrónico</span>
                                        <p>{email}</p>
                                    </div>

                                    <div className="card__body__item">
                                        <span>RFC</span>
                                        <p>{rfc}</p>
                                    </div>

                                </div>

                                <div className="right">

                                    <div className="card__body__item">
                                        <span>Fecha de cancelación</span>
                                        <p>{date}</p>
                                    </div>

                                    <div className="card__body__item">
                                        <span>Precio cuando fue cancelado</span>
                                        <p className="price" >${priceOnCancellation.toLocaleString()}</p>
                                    </div>

                                    {
                                        hadCommission && (
                                            <div className="card__body__item">
                                                <span>Cantidad de comisión</span>
                                                <p className="debt" >${commissionAmount.toLocaleString()}</p>
                                            </div>
                                        )
                                    }

                                    <div className="card__body__item">
                                        <span>Cantidad devuelta al cliente</span>
                                        <p className="debt" >${refundedAmount.toLocaleString()}</p>
                                    </div>

                                </div>

                            </div>


                        </div>
                    )
                })
            }

        </div>
    )
}
