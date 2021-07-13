import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { lotTypesModalConfirmReset } from '../../actions/lotTypes';
import { newLotsSet } from '../../actions/newLots';
import { projectSetPage } from '../../actions/project';
import { setTempError, setTempWarning } from '../../actions/ui';
import { uploadProjectDocument } from '../../actions/project';

export const Create3 = () => {

    const dispatch = useDispatch();
    const { project, project: { page }, services, types: { lotTypes }, manzanas, newLots } = useSelector(state => state);
    const [lotsSummary, setLotsSummary] = useState([]);
    const [cornersErrors, setCornersErrors] = useState([]);
    const [repeatedCorners, setRepeatedCorners] = useState([]);

    const handlePrevPage = () => {
        dispatch(lotTypesModalConfirmReset());
        dispatch(projectSetPage(+page - 1));
    }

    const handleNextPage = () => {

        const errors = checkCorners();

        if (errors.find(manzana => manzana.isEmpty)) {

            dispatch(setTempError('No puede haber esquinas sin número de lote'));

        } else {
            createProjectDocument();
        }

    }


    useEffect(() => {

        const manzanasChanged = [];
        const cornersChanged = [];
        const newLotTypes = [];


        if ((newLots.length !== 0) && (newLots.length === manzanas.length)) {

            manzanas.forEach((manzana) => {

                const arrToCompare = newLots.find(lastLot => lastLot.manzanaNum === manzana.num);

                if (arrToCompare?.corners !== manzana.corners) {
                    cornersChanged.push(manzana.num);
                }

                manzana.lotTypes.forEach((lotType) => {

                    if (!newLots.find(m => m.manzanaNum === manzana.num).lotTypes?.find(l => l.type === lotType.type)) {
                        newLotTypes.push(lotType.type);
                    }

                    const comparingType = arrToCompare?.lotTypes.find(lot => lot.type === lotType.type)

                    if (comparingType) {
                        if (comparingType.quantity !== lotType.quantity) {
                            if (manzanasChanged.indexOf(manzana.num) < 0) {
                                manzanasChanged.push(manzana.num);
                            }
                        }
                    }
                })
            })

            if (manzanasChanged.length === 0 && cornersChanged === 0 && newLotTypes.length === 0) {

                setLotsSummary(newLots);
                checkCorners(newLots);

            } else {

                const newArrJeje = [];

                newLots.forEach(manzana => {

                    if (newLotTypes.length > 0) {

                        const updatedLotTypes = manzanas.find(m => m.num === manzana.manzanaNum)?.lotTypes;

                        manzana.lotTypes = updatedLotTypes.map(e => e);

                        manzana.lotTypes.forEach(lotType => {
                            lotType.inputs = [];
                            for (let i = 1; i <= +lotType.quantity; i++) {
                                lotType.inputs.push({
                                    lotNum: '',
                                    measures: [],
                                    area: ''
                                })
                            }
                        })

                    }

                    if (manzanasChanged.includes(manzana.manzanaNum)) {

                        manzana.lotTypes.forEach(lotType => {

                            const updatedLotType = manzanas.find(m => m.num === manzana.manzanaNum).lotTypes.find(t => t.type === lotType.type);

                            lotType.inputs = [];
                            for (let i = 1; i <= +updatedLotType.quantity; i++) {
                                lotType.inputs.push({
                                    lotNum: '',
                                    measures: [],
                                    area: ''
                                })
                            }
                        })

                    }

                    if (cornersChanged.includes(manzana.manzanaNum)) {
                        const objToGetInfo = manzanas.find(({ num }) => num === manzana.manzanaNum);

                        manzana.corners = objToGetInfo.corners;

                        manzana.cornersArr = [];
                        for (let i = 1; i <= +manzana.corners; i++) {
                            manzana.cornersArr.push({
                                manzanaNum: manzana.manzanaNum,
                                lotNum: ''
                            })
                        }
                    }



                    newArrJeje.push({
                        manzanaNum: manzana.manzanaNum,
                        corners: manzana.corners,
                        lotTypes: manzana.lotTypes.map(({ type, inputs, sameArea, quantity }) => ({ type, inputs, sameArea, quantity })),
                        show: manzana.lotTypes.find(({ sameArea, quantity }) => (!sameArea && +quantity > 0)) ? true : false,
                        cornersArr: manzana.cornersArr
                    })

                })

                setLotsSummary(newArrJeje);
                dispatch(newLotsSet(newArrJeje));
                checkCorners(newArrJeje);

            }

        } else {

            const tempLotsArr = [];

            manzanas.forEach((manzana) => {
                manzana.cornersArr = [];
                for (let i = 1; i <= +manzana.corners; i++) {
                    manzana.cornersArr.push({
                        manzanaNum: manzana.manzanaNum,
                        lotNum: ''
                    })
                }

                const newLotTypes = [...manzana.lotTypes];

                newLotTypes.forEach(lotType => {
                    lotType.inputs = [];
                    for (let i = 1; i <= +lotType.quantity; i++) {
                        lotType.inputs.push({
                            lotNum: '',
                            measures: [],
                            area: ''
                        })
                    }
                })
                tempLotsArr.push({
                    manzanaNum: manzana.num,
                    corners: manzana.corners,
                    lotTypes: manzana.lotTypes.map(({ type, inputs, sameArea, quantity }) => ({ type, inputs, sameArea, quantity })),
                    show: manzana.lotTypes.find(({ sameArea, quantity }) => (!sameArea && +quantity > 0)) ? true : false,
                    cornersArr: manzana.cornersArr
                })
            })

            setLotsSummary(tempLotsArr);
            dispatch(newLotsSet(tempLotsArr));

        }



        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manzanas, dispatch]);

    const addMeasure = (e, manzanaNum, lotNum, type) => {
        e.preventDefault();


        const newArr = lotsSummary;

        newArr.find(manzana => manzana.manzanaNum === manzanaNum).lotTypes.find(lotType => lotType.type === type).inputs[lotNum].measures.push({
            measureName: '',
            measure: ''
        });

        setLotsSummary(newArr);
        dispatch(newLotsSet(newArr));
    }

    const deleteMeasure = (e, manzanaNum, lotNum, measureIndex, type) => {
        e.preventDefault();

        const newArr = lotsSummary;

        newArr.find(manzana => manzana.manzanaNum === manzanaNum).lotTypes.find(lotType => lotType.type === type).inputs[lotNum].measures.splice(measureIndex, 1);

        setLotsSummary(newArr);
        dispatch(newLotsSet(newArr));
    }


    const handleChangeCorner = ({ target }, manzanaNum, cornerIndex) => {

        const newArr = lotsSummary;

        const cornersArr = newArr.find(manzana => manzana.manzanaNum === manzanaNum).cornersArr;

        if (cornersArr.find(corner => corner.lotNum === target.value)) {
            dispatch(setTempWarning('No puede haber dos esquinas con el mismo número en la misma manzana'));
            setRepeatedCorners([...repeatedCorners, {
                manzanaNum,
                lotNum: target.value
            }])
        } else {
            setRepeatedCorners(repeatedCorners.filter(corner => (corner.manzanaNum === manzanaNum) && (corner.lotNum !== target.value)));
        }


        cornersArr[cornerIndex].lotNum = target.value;

        setLotsSummary(newArr);

        dispatch(newLotsSet(newArr));
    }


    const handleChangeLotNum = ({ target }, manzanaNum, inputIndex, type) => {

        const newArr = lotsSummary;

        newArr.find(manzana => manzana.manzanaNum === manzanaNum).lotTypes.find(lotType => lotType.type === type).inputs[inputIndex].lotNum = target.value;

        setLotsSummary(newArr);

        dispatch(newLotsSet(newArr));
    }

    const handleChangeArea = ({ target }, manzanaNum, inputIndex, type) => {

        const newArr = lotsSummary;

        newArr.find(manzana => manzana.manzanaNum === manzanaNum).lotTypes.find(lotType => lotType.type === type).inputs[inputIndex].area = target.value;

        setLotsSummary(newArr);

        dispatch(newLotsSet(newArr));
    }


    const handleChangeMeasure = ({ target }, manzanaNum, inputIndex, measureIndex, type) => {

        const newArr = lotsSummary;

        newArr.find(manzana => manzana.manzanaNum === manzanaNum).lotTypes.find(lotType => lotType.type === type).inputs[inputIndex].measures[measureIndex].measure = target.value;

        setLotsSummary(newArr);
        dispatch(newLotsSet(newArr));
    }

    const handleChangeMeasureName = ({ target }, manzanaNum, inputIndex, measureIndex, type) => {

        const newArr = lotsSummary;

        newArr.find(manzana => manzana.manzanaNum === manzanaNum).lotTypes.find(lotType => lotType.type === type).inputs[inputIndex].measures[measureIndex].measureName = target.value;

        setLotsSummary(newArr);
        dispatch(newLotsSet(newArr));
    }

    const checkCorners = (arr) => {

        const newArr = arr ? arr : lotsSummary;

        cornersErrors.splice(0, cornersErrors.length);

        let tempCornerErrors = cornersErrors.map(e => e);

        newArr.forEach(manzana => {

            const errObj = { manzanaNum: manzana.manzanaNum, corners: [], isEmpty: false };

            manzana.cornersArr.forEach(corner => {
                if (+corner.lotNum === 0) {
                    errObj.isEmpty = true

                    return;

                }

                const newObj = {
                    lotNum: corner.lotNum,
                    isRepeated: false
                }

                const existingCorner = errObj.corners.find(({ lotNum }) => lotNum === newObj.lotNum);

                if (existingCorner) {
                    existingCorner.isRepeated = true;

                    return;
                }

                errObj.corners.push(newObj)


            })

            tempCornerErrors = [...tempCornerErrors, errObj];

        })

        setCornersErrors(tempCornerErrors);

        return tempCornerErrors;
    }


    const createProjectDocument = () => {

        const irregularLotsNumbers = [];

        lotsSummary.forEach(manzana => {
            const obj = {
                manzana: manzana.manzanaNum, irregularLots: []
            }

            manzana.lotTypes.forEach(lotType => {
                if (!lotType.sameArea) {
                    lotType.inputs.forEach(({ lotNum }) => {
                        obj.irregularLots.push(+lotNum)
                    })
                }
            })

            irregularLotsNumbers.push(obj);
        })



        const lots = [];

        lotsSummary.forEach(manzana => {

            const corners = manzana.cornersArr.map(({ lotNum }) => (+lotNum));

            let lotNumCounter = 1;

            manzana.lotTypes.forEach(lotType => {

                if (lotType.sameArea) {

                    for (let i = 0; i < +lotType.quantity; i++) {
                        const irregularLots = irregularLotsNumbers.find(irr => irr.manzana === manzana.manzanaNum).irregularLots;

                        while (irregularLots.includes(lotNumCounter)) {
                            lotNumCounter++;
                        }

                        const lot = {
                            type: lotType.type,
                            lotNumber: lotNumCounter,
                            manzana: +manzana.manzanaNum,
                            isCorner: corners.includes(lotNumCounter) ? true : false
                        }

                        lots.push(lot);
                        lotNumCounter++;
                    }

                } else {

                    lotType.inputs.forEach(lotInput => {
                        const lot = {
                            type: lotType.type,
                            lotNumber: +lotInput.lotNum,
                            manzana: +manzana.manzanaNum,
                            isCorner: corners.includes(+lotInput.lotNum) ? true : false,
                            area: +lotInput.area,
                            measures: lotInput.measures.map(({ measureName, measure }) => ({
                                title: measureName,
                                value: measure
                            }))
                        }

                        lots.push(lot);

                    })


                }

            })



        })

        const projectDocument = {
            name: project.name,
            associationName: 'GG Markenting',
            description: project.description,
            availableServices: services,
            lots: [],
            lotTypes: lotTypes.map(({ type, sameArea, pricePerM, cornerPrice, area }) => (
                {
                    code: type,
                    pricesPerSqMeter: {
                        corner: cornerPrice,
                        regular: pricePerM
                    },
                    area: area ? +area : undefined,
                    measures: sameArea ? [
                        {
                            title: 'Frente',
                            value: 6
                        },
                        {
                            title: 'Fondo',
                            value: 16
                        }
                    ] : undefined
                }
            ))
        }


        dispatch(uploadProjectDocument(projectDocument, lots));

        console.log(projectDocument, lots);

    }


    return (

        <>
            <h1>
                Registro de lotes
            </h1>
            <form className="manzana-lots">
                {/* cornersErrors.find(manz => (manz.manzanaNum === manzanaNum) && (manz.isEmpty)) */}

                {
                    lotsSummary.map(({ manzanaNum, cornersArr, lotTypes, show }) => {

                        const error = cornersErrors.find(manz => (manz.manzanaNum === manzanaNum) && (manz.isEmpty));

                        return (
                            // show && (
                            <div key={manzanaNum} className={`manzana-lots__card ${error && 'error'}`}>
                                <h3>Manzana {manzanaNum}</h3>

                                {
                                    cornersArr.map((corner, cornerIndex) => {

                                        const warning = repeatedCorners.find(c => (c.manzanaNum === manzanaNum) && (c.lotNum === corner.lotNum));

                                        const isRepeated = cornersErrors?.find(manz => (manz.manzanaNum === manzanaNum))?.corners.find(i => (i.lotNum === corner.lotNum) && (i.isRepeated));

                                        return (
                                            <div key={`manzana-${manzanaNum}-corner-${cornerIndex}`} className={`form-field corners ${(error && (+corner.lotNum === 0)) && 'error'} ${(warning || isRepeated) && 'warning'}`}>
                                                <label htmlFor={`manzana-${manzanaNum}-corner-${cornerIndex}`}>
                                                    Número de lote en esquina ({+cornerIndex + 1}):
                                                </label>
                                                <input onChange={(e) => handleChangeCorner(e, manzanaNum, cornerIndex)} type="number" name={`manzana-${manzanaNum}-corner-${cornerIndex}`} value={corner.lotNum} />
                                            </div>
                                        )
                                    })
                                }

                                {
                                    lotTypes.map(({ type, inputs, sameArea, quantity }) => (
                                        (!sameArea && +quantity > 0) && (
                                            <div className="manzana-lots__card__content" key={`${manzanaNum}-${type}`}>
                                                <h4  >Lotes tipo "{type.toUpperCase()}"</h4>
                                                {
                                                    inputs.map(({ lotNum, area, measures }, inputIndex) => (
                                                        <div key={`manzana-${manzanaNum}-${type}-${inputIndex}-lotNum`} className="manzana-lots__card__inputs">
                                                            <div className={`form-field lot-num`}>
                                                                <label htmlFor={`manzana-${manzanaNum}-${type}-${inputIndex}-lotNum`}>
                                                                    Número de lote:
                                                                </label>
                                                                <input onChange={(e) => handleChangeLotNum(e, manzanaNum, inputIndex, type)} type="number" name={`manzana-${manzanaNum}-${type}-${inputIndex}-lotNum`} value={lotNum} />
                                                            </div>

                                                            <div className={`form-field lot-area`}>
                                                                <label htmlFor={`manzana-${manzanaNum}-${type}-${inputIndex}-area`}>
                                                                    Área:
                                                                </label>
                                                                <input onChange={(e) => handleChangeArea(e, manzanaNum, inputIndex, type)} type="number" name={`manzana-${manzanaNum}-${type}-${inputIndex}-area`} value={area} />
                                                            </div>

                                                            <div className="btn">
                                                                <button onClick={(e) => { addMeasure(e, manzanaNum, inputIndex, type) }} className="add-measure">
                                                                    Agregar medida
                                                                </button>
                                                            </div>

                                                            {
                                                                measures.map(({ measureName, measure }, measureIndex) => (
                                                                    <div key={`manzana-${manzanaNum}-${type}-${measureIndex}-lotNum`} className={`lot-measure`}>

                                                                        <div className="name form-field">
                                                                            <label htmlFor={`manzana-${manzanaNum}-${type}-${measureIndex}-lotNum-name`}>
                                                                                Nombre de medida:
                                                                            </label>
                                                                            <input onChange={(e) => handleChangeMeasureName(e, manzanaNum, inputIndex, measureIndex, type)} type="text" name={`manzana-${manzanaNum}-${type}-${measureIndex}-lotNum-name`} value={measureName} />
                                                                        </div>

                                                                        <div className="measure form-field">
                                                                            <label htmlFor={`manzana-${manzanaNum}-${type}-${measureIndex}-lotNum-measure`}>
                                                                                Medida:
                                                                            </label>
                                                                            <input onChange={(e) => handleChangeMeasure(e, manzanaNum, inputIndex, measureIndex, type)} type="number" name={`manzana-${manzanaNum}-${type}-${measureIndex}-lotNum-measure`} value={measure} />
                                                                        </div>

                                                                        <button onClick={e => deleteMeasure(e, manzanaNum, inputIndex, measureIndex, type)} className="delete-measure">
                                                                            &times;
                                                                        </button>

                                                                    </div>
                                                                ))
                                                            }

                                                        </div>

                                                    )
                                                    )
                                                }

                                            </div>
                                        )
                                    ))
                                }
                            </div>
                            // )
                        )
                    })
                }

            </form>


            <div className="project-create-btns">
                <button onClick={handlePrevPage} className="btn btn-cancel">
                    Anterior
                </button>
                <button onClick={handleNextPage} className="btn btn-next">
                    Siguiente
                </button>
            </div>

        </>

    )
}
