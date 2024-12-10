import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, TextInput, Button } from 'react-native';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCurrency, setNewCurrency] = useState('');
  const [newPages, setNewPages] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newBookId, setNewBookId] = useState('');

  // Hàm fetch danh sách eBooks
  const fetchBooks = async () => {
    try {
      const response = await fetch('http://192.168.1.7:6001/v1/list'); // Đường dẫn API lấy danh sách
      const data = await response.json();

      if (data && data.data) {
        setBooks(data.data); // Gán danh sách sách vào state
      } else {
        setBooks([]); // Trường hợp không có dữ liệu
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách eBooks:', error.message);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  // Hàm sửa eBook
  const updateBook = async (id, updatedBook) => {
    try {
      const response = await fetch(`http://192.168.1.7:6001/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBook), // Gửi thông tin sửa vào body
      });

      console.log('Response Status:', response.status); // Kiểm tra mã trạng thái

      if (!response.ok) {
        throw new Error('Lỗi khi cập nhật eBook');
      }

      const data = await response.json();
      console.log('Response Data:', data); // Xem dữ liệu phản hồi từ server

      // Cập nhật lại danh sách sách sau khi sửa thành công
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === id ? { ...book, ...updatedBook } : book
        )
      );

      Alert.alert('Thành công', 'Cập nhật eBook thành công!');
      setIsEditing(false); // Đóng form chỉnh sửa
    } catch (error) {
      console.error('Lỗi khi cập nhật eBook:', error.message);
      Alert.alert('Lỗi', 'Không thể cập nhật eBook. Vui lòng thử lại sau.');
    }
  };
  //hàm validate
  const validateBook = (updatedBook) => {
    if (!updatedBook.bookId) {
      Alert.alert('Lỗi', 'bookId không được để trống.');
      return false;
    }

    if (updatedBook.title && updatedBook.title.length < 3) {
      Alert.alert('Lỗi', 'Title phải có ít nhất 3 kí tự.');
      return false;
    }

    if (updatedBook.author && updatedBook.author.trim() === '') {
      Alert.alert('Lỗi', 'Author không được để trống.');
      return false;
    }

    if (updatedBook.price && (isNaN(updatedBook.price) || updatedBook.price <= 0)) {
      Alert.alert('Lỗi', 'Price phải là số và lớn hơn 0.');
      return false;
    }

    if (updatedBook.currency && !['USD', 'EUR', 'VND'].includes(updatedBook.currency)) {
      Alert.alert('Lỗi', 'Currency phải là một trong các giá trị: USD, EUR, VND.');
      return false;
    }

    if (updatedBook.details && typeof updatedBook.details !== 'object') {
      Alert.alert('Lỗi', 'Details phải là một object.');
      return false;
    }

    return true;
  };

  // Hàm xóa eBook
  const deleteBook = async (author) => {
    try {
      const response = await fetch(`http://192.168.1.7:6001/delete?author=${encodeURIComponent(author)}`, {
        // hàm encodeURIComponent  dùng để mã hóa một chuỗi vid dụ(Dấu cách sẽ trở thành %20)
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Lỗi khi xóa eBook');
      }
  
      // Cập nhật lại danh sách sách sau khi xóa thành công
      setBooks((prevBooks) => prevBooks.filter((book) => book.author !== author));
      Alert.alert('Thành công', 'Xóa eBook thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa eBook:', error.message);
      Alert.alert('Lỗi', 'Không thể xóa eBook. Vui lòng thử lại sau.');
    }
  };
  

  useEffect(() => {
    fetchBooks(); // Lấy dữ liệu khi component được render
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Danh sách eBooks</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>Title: {item.title}</Text>
              <Text>Book ID: {item.bookId}</Text>
              <Text>Author: {item.author}</Text>
              <Text>Price: {item.price} {item.currency}</Text>

              {item.details && typeof item.details === 'object' ? (
                <View>
                  <Text>Details:</Text>
                  {item.details.pages && <Text>Pages: {item.details.pages}</Text>}
                  {item.details.language && <Text>Language: {item.details.language}</Text>}
                  {item.details.publisher && <Text>Publisher: {item.details.publisher}</Text>}
                </View>
              ) : (
                <Text>No details available</Text>
              )}

              <View style={styles.buttonsContainer}>
                <Button
                  title="Sửa"
                  onPress={() => {
                    setIsEditing(true);
                    setEditingBook(item);
                    setNewTitle(item.title);
                    setNewBookId(item.bookId);
                    setNewAuthor(item.author);
                    setNewPrice(item.price.toString());
                    setNewCurrency(item.currency);
                    setNewPages(item.details?.pages.toString() || '');
                    setNewLanguage(item.details?.language || '');
                    setNewPublisher(item.details?.publisher || '');
                  }}

                />
                <Button
                  title="Xóa theo tên tác giả"
                  onPress={() => deleteBook(item.author)} // xóa theo author
                />
              </View>
            </View>
          )}
        />
      )}

      {isEditing && (
        <View style={styles.editForm}>
          <Text style={styles.editHeading}>Chỉnh sửa eBook</Text>
          <TextInput
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="New Title"
          />
          <TextInput
            style={styles.input}
            value={newBookId}
            onChangeText={setNewBookId}
            placeholder="New Book ID"
          />
          <TextInput
            style={styles.input}
            value={newAuthor}
            onChangeText={setNewAuthor}
            placeholder="New Author"
          />
          <TextInput
            style={styles.input}
            value={newPrice}
            onChangeText={setNewPrice}
            placeholder="New Price"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={newCurrency}
            onChangeText={setNewCurrency}
            placeholder="New Currency"
          />
          <TextInput
            style={styles.input}
            value={newPages}
            onChangeText={setNewPages}
            placeholder="New Pages"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={newLanguage}
            onChangeText={setNewLanguage}
            placeholder="New Language"
          />
          <TextInput
            style={styles.input}
            value={newPublisher}
            onChangeText={setNewPublisher}
            placeholder="New Publisher"
          />

          <Button
            title="Lưu thay đổi"
            onPress={() => {
              const updatedBook = {
                title: newTitle,
                author: newAuthor,
                price: parseFloat(newPrice),
                currency: newCurrency,
                details: {
                  pages: parseInt(newPages),
                  language: newLanguage,
                  publisher: newPublisher,
                },
                bookId: newBookId,
              };

              if (validateBook(updatedBook)) {
                updateBook(editingBook._id, updatedBook);
              }
            }}
          />

          <Button title="Hủy" onPress={() => setIsEditing(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editForm: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  editHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});
