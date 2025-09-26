import style from './spiner.module.css'

export default function Loading(){
    return (
        <div className={`${style.spinner} ${style.center}`}>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
    <div className={style.spinnerBlade}></div>
</div>
    );
}