// checkAccess.js - ไฟล์สำหรับตรวจสอบสิทธิ์การเข้าถึงหน้าต่างๆ

// ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึงหน้าต่างๆ
function checkAccess(permission) {
    return new Promise((resolve, reject) => {
      // ดึงข้อมูลผู้ใช้ปัจจุบัน
      const currentUser = firebase.auth().currentUser;
      
      // ถ้าไม่มีผู้ใช้ที่เข้าสู่ระบบ ไม่มีสิทธิ์เข้าถึง
      if (!currentUser) {
        resolve(false);
        return;
      }
      
      // อีเมลพิเศษที่มีสิทธิ์ godMode (สามารถเข้าถึงได้ทุกหน้า)
      const godModeEmails = ['katerkfx@gmail.com'];
      if (godModeEmails.includes(currentUser.email)) {
        resolve(true);
        return;
      }
      
      // ตรวจสอบข้อมูลผู้ใช้ใน Firestore (ทั้งใน collection 'users' และ collection 'companies')
      Promise.all([
        // ตรวจสอบใน collection 'users'
        firebase.firestore().collection('users').doc(currentUser.uid).get(),
        
        // ตรวจสอบใน collection 'companies'
        firebase.firestore().collectionGroup('users').where('email', '==', currentUser.email).get()
      ])
      .then(([userDoc, companyUsersSnapshot]) => {
        // ตรวจสอบว่าเป็น admin ใน collection 'users' หรือไม่
        if (userDoc.exists && userDoc.data().role === 'admin') {
          resolve(true);
          return;
        }
        
        // ตรวจสอบสิทธิ์ใน collection 'companies'
        if (!companyUsersSnapshot.empty) {
          let hasPermission = false;
          
          // วนลูปตรวจสอบทุกบริษัทที่ผู้ใช้เป็นสมาชิก
          companyUsersSnapshot.forEach((doc) => {
            const userData = doc.data();
            
            // ถ้าเป็น admin ในบริษัทใดบริษัทหนึ่ง
            if (userData.role === 'admin' || userData.role === 'super') {
              hasPermission = true;
            }
            
            // ตรวจสอบสิทธิ์เฉพาะ
            if (userData.permissions && userData.permissions.includes(permission)) {
              hasPermission = true;
            }
            
            // ตรวจสอบสิทธิ์ตาม allowedMenus ในกรณีที่เป็น user ธรรมดา
            const companyRef = doc.ref.parent.parent;
            if (companyRef) {
              companyRef.get().then((companyDoc) => {
                if (companyDoc.exists) {
                  const companyData = companyDoc.data();
                  if (companyData.godModeSettings && 
                      companyData.godModeSettings.allowedMenus && 
                      companyData.godModeSettings.allowedMenus.includes(permission)) {
                    hasPermission = true;
                  }
                }
              }).catch((error) => {
                console.error("Error getting company document:", error);
              });
            }
          });
          
          resolve(hasPermission);
          return;
        }
        
        // ถ้าไม่พบข้อมูลผู้ใช้ในทั้งสองที่ ไม่มีสิทธิ์เข้าถึง
        resolve(false);
      })
      .catch((error) => {
        console.error("Error checking access:", error);
        reject(error);
      });
    });
  }
  
  // ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึง Vendor
  function checkVendorAccess(vendorCode) {
    return new Promise((resolve, reject) => {
      // ดึงข้อมูลผู้ใช้ปัจจุบัน
      const currentUser = firebase.auth().currentUser;
      
      // ถ้าไม่มีผู้ใช้ที่เข้าสู่ระบบ ไม่มีสิทธิ์เข้าถึง
      if (!currentUser) {
        resolve(false);
        return;
      }
      
      // อีเมลพิเศษที่มีสิทธิ์ godMode (สามารถเข้าถึงได้ทุก Vendor)
      const godModeEmails = ['katerkfx@gmail.com'];
      if (godModeEmails.includes(currentUser.email)) {
        resolve(true);
        return;
      }
      
      // ตรวจสอบข้อมูลผู้ใช้ใน Firestore
      firebase.firestore().collection('users').doc(currentUser.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            
            // ตรวจสอบว่าเป็น admin หรือไม่
            if (userData.role === 'admin') {
              resolve(true);
              return;
            }
            
            // ตรวจสอบสิทธิ์การเข้าถึง Vendor
            if (userData.vendor_access && userData.vendor_access.includes(vendorCode)) {
              resolve(true);
              return;
            }
            
            // ถ้าไม่มีสิทธิ์เข้าถึง Vendor นี้
            resolve(false);
          } else {
            // ถ้าไม่พบข้อมูลผู้ใช้
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Error checking vendor access:", error);
          reject(error);
        });
    });
  }
  
  // ฟังก์ชันดึงบทบาทของผู้ใช้
  function getUserRole() {
    return new Promise((resolve, reject) => {
      // ดึงข้อมูลผู้ใช้ปัจจุบัน
      const currentUser = firebase.auth().currentUser;
      
      // ถ้าไม่มีผู้ใช้ที่เข้าสู่ระบบ
      if (!currentUser) {
        resolve('none');
        return;
      }
      
      // อีเมลพิเศษที่มีสิทธิ์ godMode
      const godModeEmails = ['katerkfx@gmail.com'];
      if (godModeEmails.includes(currentUser.email)) {
        resolve('godMode');
        return;
      }
      
      // ตรวจสอบข้อมูลผู้ใช้ใน Firestore
      firebase.firestore().collection('users').doc(currentUser.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            resolve(userData.role || 'user');
          } else {
            // ถ้าไม่พบข้อมูลผู้ใช้
            resolve('none');
          }
        })
        .catch((error) => {
          console.error("Error getting user role:", error);
          reject(error);
        });
    });
  }
  
  // ฟังก์ชันดึงรายการ Vendor ที่มีสิทธิ์เข้าถึง
  function getAccessibleVendors() {
    return new Promise((resolve, reject) => {
      // ดึงข้อมูลผู้ใช้ปัจจุบัน
      const currentUser = firebase.auth().currentUser;
      
      // ถ้าไม่มีผู้ใช้ที่เข้าสู่ระบบ
      if (!currentUser) {
        resolve([]);
        return;
      }
      
      // อีเมลพิเศษที่มีสิทธิ์ godMode (สามารถเข้าถึงได้ทุก Vendor)
      const godModeEmails = ['katerkfx@gmail.com'];
      if (godModeEmails.includes(currentUser.email)) {
        // ดึงรายการ Vendor ทั้งหมด
        firebase.firestore().collection('vendors').get()
          .then((snapshot) => {
            const allVendors = snapshot.docs.map(doc => doc.id);
            resolve(allVendors);
          })
          .catch((error) => {
            console.error("Error getting all vendors:", error);
            reject(error);
          });
        return;
      }
      
      // ตรวจสอบข้อมูลผู้ใช้ใน Firestore
      firebase.firestore().collection('users').doc(currentUser.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            
            // ถ้าเป็น admin ให้เข้าถึงได้ทุก Vendor
            if (userData.role === 'admin') {
              firebase.firestore().collection('vendors').get()
                .then((snapshot) => {
                  const allVendors = snapshot.docs.map(doc => doc.id);
                  resolve(allVendors);
                })
                .catch((error) => {
                  console.error("Error getting all vendors:", error);
                  reject(error);
                });
              return;
            }
            
            // ส่งคืนรายการ Vendor ที่มีสิทธิ์เข้าถึง
            resolve(userData.vendor_access || []);
          } else {
            // ถ้าไม่พบข้อมูลผู้ใช้
            resolve([]);
          }
        })
        .catch((error) => {
          console.error("Error getting accessible vendors:", error);
          reject(error);
        });
    });
  }
  
  // เพิ่มฟังก์ชันไว้ใน window object เพื่อให้สามารถเข้าถึงได้จากภายนอก
  window.accessControl = {
    checkAccess,
    checkVendorAccess,
    getUserRole,
    getAccessibleVendors
  };