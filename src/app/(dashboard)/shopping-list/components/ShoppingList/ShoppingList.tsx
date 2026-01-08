import styles from './ShoppingList.module.scss';

export default function ShoppingList() {
  return (
    <div className={styles.container}>
      <ul>
        <li>chlepy</li>
        <li>ziemniaki</li>
        <li>ziemniaki</li>
        <li>ziemniaki</li>
        <li>ziemniaki</li>
        <li>ziemniaki</li>
      </ul>
    </div>
  );
}

// TODO: logika + button pod tworzenie nowej listy typu: warzywniak, nabiał, zakupy w merkusie itp.

// TODO: zmiana pozycji elementów listy poprzez drag and drop

// TODO: Zapisywanie listy do bazy danych

// TODO: Zapisywanie nowych produktów oraz ich kolejności do bazy danych

// TODO: Zapisywanie globalnych statystyk produktów jak ilość zakupionych produktów w bazie danych

//TODO: Algorytm propozycji produktów do zakupu na bazie statystyki zakupionych produktów np. częstotliwość kupowania i odległość od daty ostatniego zakupu

//TODO:
